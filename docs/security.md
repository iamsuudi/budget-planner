# Security Documentation

## Overview

Budget Manager implements client-side security features to protect user data within the browser. The security system includes PIN protection, biometric authentication via WebAuthn, session management, and a factory reset option.

**Important**: All security is enforced client-side. This provides convenience security (preventing casual access) but not bank-grade security, as the code runs on the user's device and can theoretically be manipulated.

## Security Features

| Feature | Description |
|---------|-------------|
| PIN Protection | 4-digit PIN stored as SHA-256 hash with random salt |
| Biometric Auth | WebAuthn-based authentication supporting multiple authenticator types |
| Session Persistence | Auth state survives page refreshes via sessionStorage |
| Auto-Lock | Automatic lock after 5 minutes of inactivity |
| App Reset | Last-resort option to wipe all data and start fresh |

## PIN Security

### Implementation

PINs are **never stored in plain text**. The implementation uses:

1. **Random Salt**: 16-byte random salt generated with `crypto.getRandomValues()`
2. **SHA-256 Hashing**: PIN + salt is hashed using the Web Crypto API
3. **Storage Format**: `salt:hash` (hex-encoded)

```typescript
// Storage format in localStorage['pin-hash']
// salt (32 hex chars) + ':' + hash (64 hex chars)
"a1b2c3d4e5f67890:1234567890abcdef..."
```

### PIN Verification Flow

```
User enters PIN → Concatenate with stored salt → SHA-256 hash → Compare with stored hash
```

### Security Considerations

- **Not bank-grade**: PIN verification happens in JavaScript and can be bypassed by modifying client code
- **Local only**: PIN is only checked locally, no server-side auth
- **4-digit limitation**: Only 10,000 possible combinations (suitable for convenience, not high security)

## Biometric Authentication (WebAuthn)

### Supported Authenticator Types

The app supports three types of WebAuthn authenticators:

| Type | Description | Example |
|------|-------------|---------|
| `platform` | Built-in device biometric/security | Fingerprint, Face ID, Windows Hello |
| `cross-platform` | External security devices | USB security keys (YubiKey), phones, tablets |
| `google-password-manager` | Browser-based passkey storage | Google Password Manager |

### Authenticator Selection

When enabling biometric auth, users can choose their preferred authenticator type. The app detects available types:

- **Platform authenticator**: Detected via `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()`
- **Cross-platform**: Always available if WebAuthn is supported
- **Google Password Manager**: Offered as an option (browser handles the flow)

### WebAuthn Implementation Details

**Registration (Setup)**:
```typescript
navigator.credentials.create({
  publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)), // Random challenge
    rp: { name: 'Budget Manager', id: window.location.hostname },
    user: { id: userId, name: 'user@budgetmanager', displayName: '...' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
      authenticatorAttachment: 'platform' | 'cross-platform' | undefined
    },
    timeout: 60000
  }
})
```

**Authentication**:
```typescript
navigator.credentials.get({
  publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)), // Random challenge
    allowCredentials: [{ id: credentialId, type: 'public-key' }],
    userVerification: 'required',
    timeout: 60000
  }
})
```

### Credential Storage

- Credential ID is stored in `localStorage['passkey-credential-id']` (base64-encoded)
- User ID is stored in `localStorage['user-id']` (hex-encoded, generated once)
- The actual private key never leaves the authenticator

## Session Management

### Problem: Auto-Lock on Refresh

**Original Issue**: App would lock every time the user refreshed the page, even if recently authenticated.

**Solution**: Use `sessionStorage` to persist auth state across page refreshes.

### Implementation

```typescript
// On successful authentication (PIN or biometric)
sessionStorage.setItem('security-auth', 'true')

// On page load, check session auth state
const isSessionAuthenticated = sessionStorage.getItem('security-auth') === 'true'

// sessionStorage survives page refreshes but clears when:
// - Tab/window is closed
// - Browser is closed
// - sessionStorage.clear() is called
```

### Auth State Transitions

```
Page Load → Check sessionStorage → Authenticated? → Skip lock screen
                                     ↓
                                   Not Auth → Show lock screen
                                               ↓
                                    Authenticate → Set sessionStorage → Unlock
```

## Auto-Lock (Inactivity Timer)

### Configuration

- **Timeout**: 5 minutes (300,000 ms)
- **Configurable**: `INACTIVITY_TIMEOUT` constant in `security.tsx`

### Activity Detection

The following events reset the inactivity timer:
- `mousemove`
- `keydown`
- `click`
- `touchstart`
- `scroll`

### Implementation

```typescript
// Start timer on unlock
const timer = setTimeout(() => lock(), INACTIVITY_TIMEOUT)

// Reset timer on user activity
const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']
events.forEach(event => window.addEventListener(event, resetTimer))
```

## App Reset (Factory Reset)

### When to Use

- User forgets PIN and cannot use biometric auth
- User wants to start fresh with new security settings
- Troubleshooting security issues

### What Gets Deleted

**IndexedDB (All app data)**:
- User profile
- Wallets and accounts
- Expense/income records
- Categories
- Month budgets
- Todo lists and tasks
- Notes

**localStorage**:
- Security settings (`security-settings`)
- PIN hash (`pin-hash`)
- Passkey credential ID (`passkey-credential-id`)
- User ID (`user-id`)
- SW registration version (`swRegisteredVersion`)

**sessionStorage**:
- Auth state (`security-auth`)
- SW dismissal state (`sw-dismissed-update`)

### Reset Flow

```
Lock Screen → "Reset App" button → Confirmation dialog → Delete all data → Reload page → First-time setup
```

### Safety Measures

1. **Confirmation dialog**: Lists all data types being deleted
2. **Warning text**: "This action cannot be undone"
3. **Accessible only from lock screen**: Not available when app is unlocked

## Security Settings Storage

### localStorage Keys

| Key | Purpose | Format |
|-----|---------|--------|
| `security-settings` | PIN/biometric enable state | JSON: `{ pinEnabled, biometricEnabled, authenticatorType }` |
| `pin-hash` | Hashed PIN with salt | `salt:hash` (hex:hex) |
| `passkey-credential-id` | WebAuthn credential ID | Base64-encoded ArrayBuffer |
| `user-id` | Unique user ID for WebAuthn | Hex-encoded 16-byte array |

### sessionStorage Keys

| Key | Purpose |
|-----|---------|
| `security-auth` | Auth state (`'true'` when authenticated) |

## Biometric Reset Behavior

### Issue: PIN Reset Also Reset Biometric

**Original Issue**: When resetting PIN with biometric, both PIN and biometric settings were cleared.

**Fix**: `resetPinWithBiometric()` now:
1. Authenticates with biometric FIRST
2. Only clears PIN data
3. Preserves biometric settings

```typescript
const resetPinWithBiometric = async () => {
  const isAuth = await authenticateWithBiometric() // Verify biometric FIRST
  if (!isAuth) throw new Error('Biometric authentication failed')

  localStorage.removeItem('pin-hash') // Only clear PIN
  // Biometric settings preserved in security-settings
}
```

## Service Worker Updates & Data Persistence

### How It Works

The service worker (`sw-template.js`) only manages **cache storage**, not **IndexedDB**:

```javascript
// SW activate event - only clears old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
             .map((key) => caches.delete(key))
      )
    })
  )
})
```

### What Persists Across SW Updates

- **IndexedDB**: All app data (wallets, expenses, etc.) - NOT touched by SW
- **localStorage**: Security settings, PIN hash, etc. - NOT touched by SW
- **sessionStorage**: Cleared on page reload (intentional)

### What Gets Updated

- **Cache Storage**: App assets (HTML, JS, CSS) - managed by SW versioning

## Security Architecture

### Component Hierarchy

```
SecurityProvider (Context)
  ├─ LockScreen (shows when isLocked=true)
  │    ├─ PinInput (PIN entry/setup)
  │    ├─ Biometric button (fingerprint icon)
  │    └─ Reset App button
  └─ Children (app content, only rendered when isLocked=false)
```

### Context API Values

```typescript
interface SecurityContextValue {
  isLocked: boolean              // Whether app is locked
  isAuthenticated: boolean       // Whether user is authenticated
  pinEnabled: boolean           // Whether PIN is set
  biometricEnabled: boolean     // Whether biometric is enabled
  biometricAvailable: boolean   // Whether WebAuthn is available
  isFirstTime: boolean         // First time setup needed
  authenticatorType: AuthenticatorType | undefined
  unlock: () => void           // Unlock the app
  lock: () => void             // Lock the app
  setupPin: (pin: string) => Promise<void>
  verifyPin: (pin: string) => Promise<boolean>
  toggleBiometric: (enabled: boolean, type?) => Promise<void>
  removePin: () => Promise<void>
  resetPinWithBiometric: () => Promise<void>
  resetApp: () => Promise<void>
  getAvailableAuthenticators: () => Promise<AuthenticatorType[]>
}
```

## File Structure

| File | Purpose |
|------|---------|
| `src/lib/security.tsx` | Security context, PIN hashing, WebAuthn, session management |
| `src/components/PinInput.tsx` | PIN entry UI, lock screen, reset app UI |
| `src/routes/settings/index.tsx` | Security settings page, biometric toggle |
| `src/routes/settings/security/pin.tsx` | PIN setup/change/removal flow |

## Security Considerations & Limitations

### Client-Side Only

- No server-side authentication
- All security logic runs in the user's browser
- A technically skilled user can bypass security by modifying JavaScript

### Appropriate Use Case

This security implementation is suitable for:
- Preventing casual access (roommates, family members)
- Quick privacy protection
- Convenience security on personal devices

Not suitable for:
- High-security applications
- Multi-user environments with sensitive data
- Applications requiring compliance (HIPAA, PCI-DSS, etc.)

### Recommendations for Enhanced Security

1. **Add server-side auth**: Move authentication to a backend service
2. **Encrypt IndexedDB data**: Use encryption keys derived from PIN/biometric
3. **Add rate limiting**: Limit PIN attempts to prevent brute force
4. **Use Content Security Policy**: Prevent code injection
5. **Add HTTPS enforcement**: Ensure transport security (already handled by PWAs)

## Troubleshooting

### Biometric Auth Not Working

1. Check if WebAuthn is supported: `PublicKeyCredential in window`
2. Check for platform authenticator: `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()`
3. Ensure you're on HTTPS or localhost (WebAuthn requirement)
4. Check browser console for errors

### PIN Hash Issues

- PIN hash is stored as `salt:hash` in localStorage
- To reset: Clear localStorage or use "Reset App" feature
- Hash uses SHA-256 with a 16-byte random salt

### Session Not Persisting

- Auth state is in `sessionStorage`, not `localStorage`
- Survives refreshes but NOT tab/window close
- This is intentional for security

## Future Enhancements

- [ ] Add PIN attempt limiting (lockout after N failed attempts)
- [ ] Encrypt IndexedDB data with keys derived from PIN
- [ ] Add security audit log (failed attempts, lock/unlock events)
- [ ] Support multiple biometric authenticators simultaneously
- [ ] Add option to require biometric for sensitive operations (not just unlock)
- [ ] Implement server-side authentication option
