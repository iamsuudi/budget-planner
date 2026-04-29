# App Flow Documentation

## Overview

Budget Manager is a Progressive Web App (PWA) that provides three core apps in one: **Budget Planner**, **Todo List**, and **Notes**. This document describes the complete user flow from first visit to daily use.

## First-Time User Flow

### 1. Initial Visit

```
User opens app (first time)
  ↓
Check: welcome-seen in localStorage?
  ↓ (not found)
Redirect to /welcome
```

**File**: `src/routes/welcome.tsx`

### 2. Welcome/Onboarding Pages

```
Welcome Page (/welcome)
  ↓
5 Sliding Pages:
  1. Welcome - "3 apps in one" introduction
  2. Budget Planner - Track expenses, manage wallets
  3. Todo List - Organize tasks, set priorities
  4. Notes - Rich text editing, organize ideas
  5. Secure Your Data - PIN and biometric info
  ↓
User clicks "Get Started"
  ↓
localStorage['welcome-seen'] = 'true'
  ↓
Navigate to /settings/security/pin
```

**Features**:
- Smooth sliding transitions between pages
- Pagination dots showing progress
- Skip button (top-right) to skip onboarding
- Navigation: Back/Next buttons
- Last page has "Get Started" button

### 3. PIN Setup

```
PIN Setup Page (/settings/security/pin)
  ↓
User enters 4-digit PIN
  ↓
Confirm PIN (re-enter)
  ↓
PIN hashed with SHA-256 + random salt
  ↓
Stored in localStorage['pin-hash'] as salt:hash
  ↓
Security settings updated: { pinEnabled: true }
  ↓
Navigate to /settings
```

**File**: `src/routes/settings/security/pin.tsx`

### 4. Optional: Biometric Setup

```
Settings Page (/settings)
  ↓
User toggles "Biometric Unlock"
  ↓
Choose authenticator type:
  - Platform (fingerprint, Face ID, Windows Hello)
  - Cross-platform (USB key, phone, tablet)
  - Google Password Manager
  ↓
WebAuthn registration with selected type
  ↓
Credential ID stored in localStorage['passkey-credential-id']
  ↓
Security settings updated: { biometricEnabled: true, authenticatorType }
```

**File**: `src/lib/security.tsx`

### 5. SW Registration (Delayed)

```
User lands on main app (/)
  ↓
Check: shouldRegisterSW()?
  - welcome-seen === 'true'
  - security-settings.pinEnabled || security-settings.biometricEnabled
  ↓ (both true)
Register Service Worker
  ↓
SWProgressBar shows at top of screen
  ↓
Download progress: 0% → 100%
  ↓
"App ready for offline use" toast
```

**File**: `src/main.tsx` - `registerServiceWorker()` function

## Returning User Flow

### Normal Startup

```
User opens app (returning user)
  ↓
Check: welcome-seen exists?
  ↓ (yes)
Skip welcome page
  ↓
Check: sessionStorage['security-auth'] === 'true'?
  ↓ (yes, session still active)
Skip lock screen
  ↓
Show main app (no lock screen)
```

### After Session Expiry (Tab Closed)

```
User opens app (returning, new session)
  ↓
sessionStorage cleared (tab was closed)
  ↓
Check: pinEnabled || biometricEnabled?
  ↓ (yes)
Show Lock Screen
  ↓
User authenticates via:
  - PIN entry
  - Biometric (if enabled)
  ↓
sessionStorage['security-auth'] = 'true'
  ↓
Unlock app
```

## Lock Screen Behavior

**File**: `src/components/PinInput.tsx` - `LockScreen()` component

### PIN Authentication

```
Lock Screen shown
  ↓
User enters 4-digit PIN
  ↓
PIN + stored salt → SHA-256 hash
  ↓
Compare with stored hash in localStorage['pin-hash']
  ↓ (match)
Unlock app, set sessionStorage['security-auth']
```

### Biometric Authentication

```
Lock Screen shown
  ↓
User clicks fingerprint icon
  ↓
WebAuthn authentication (navigator.credentials.get)
  ↓ (success)
Unlock app, set sessionStorage['security-auth']
```

### Forgot PIN / Reset Options

```
Lock Screen shown
  ↓
User clicks "Forgot PIN? Reset with biometric"
  ↓ (if biometric enabled)
Biometric authentication
  ↓ (success)
Navigate to /settings/security/pin (to set new PIN)
```

### Reset App (Last Resort)

```
Lock Screen shown
  ↓
User clicks "Reset App (Delete all data)"
  ↓
Confirmation dialog shows:
  - Lists ALL data that will be deleted
  - Warning: "This action cannot be undone"
  ↓
User confirms
  ↓
Clear IndexedDB (all app data)
Clear localStorage (security settings, etc.)
Clear sessionStorage
  ↓
Reload page
  ↓
Back to first-time flow (welcome → PIN setup)
```

## Auto-Lock (Inactivity)

**Configuration**: 5 minutes (300,000 ms)

```
User authenticated, using app
  ↓
User inactive for 5 minutes (no mousemove, keydown, click, touchstart, scroll)
  ↓
Auto-lock fires
  ↓
sessionStorage['security-auth'] removed
  ↓
Lock screen shown
```

**File**: `src/lib/security.tsx` - `INACTIVITY_TIMEOUT` constant

## Service Worker Update Flow

### Normal Update (After Onboarding)

```
User opens app (returning)
  ↓
main.tsx: checkForUpdate() fetches /version.json
  ↓
Version mismatch detected (server > local)
  ↓
sw-update-available event fired
  ↓
usePWAUpdate hook → state = 'available'
  ↓
UpdatePrompt shows: "v{old} → v{new}"
  ↓
User clicks "Update"
  ↓
State → 'downloading', progress bar shows
  ↓
Register new sw-v{version}.js
  ↓
Download progress: 0% → 100%
  ↓
State → 'waiting'
  ↓
User clicks "Activate"
  ↓
SKIP_WAITING sent to SW
  ↓
controllerchange event → page reloads
  ↓
New SW active, versions match
```

### Force Update

```
version.json has "forceUpdate": true
  ↓
UpdatePrompt: no dismiss button
  ↓
User must update
```

## Navigation Structure

```
/
├── /welcome (first-time only)
├── /settings
│   ├── /security/pin (PIN setup/change)
│   ├── /wallets
│   ├── /currency
│   └── ...
├── /budget
├── /expense
│   ├── /add
│   ├── /transactions
│   └── /categories
├── /salary
│   ├── /add
│   ├── /transactions
│   └── /categories
├── /todo
│   ├── /add
│   └── /categories
└── /note
    ├── /add
    └── /view/:id
```

## Key Files

| File | Purpose |
|------|---------|
| `src/routes/welcome.tsx` | Welcome/onboarding pages with sliding transitions |
| `src/routes/__root.tsx` | Root component with WelcomeGate redirect |
| `src/lib/security.tsx` | Security context, PIN hashing, WebAuthn, session management |
| `src/components/PinInput.tsx` | PIN entry UI, LockScreen, Reset App UI |
| `src/routes/settings/security/pin.tsx` | PIN setup/change/removal flow |
| `src/main.tsx` | Entry point, delayed SW registration |
| `src/hooks/useSWProgress.tsx` | SW download progress tracking |
| `src/components/SWProgressBar.tsx` | Progress bar UI (shows after onboarding) |

## State Management

### localStorage Keys

| Key | Purpose | Set When |
|-----|---------|----------|
| `welcome-seen` | Onboarding completed | After welcome slides |
| `security-settings` | PIN/biometric state | After setup |
| `pin-hash` | Hashed PIN + salt | After PIN setup |
| `passkey-credential-id` | WebAuthn credential | After biometric setup |
| `user-id` | Unique user ID | First biometric setup |
| `swRegisteredVersion` | SW version | After SW registration |

### sessionStorage Keys

| Key | Purpose | Cleared When |
|-----|---------|---------------|
| `security-auth` | Auth state | Tab closed, lock, logout |

## Security Flow Diagram

```
                    ┌───────────────────┐
                    │   First Visit?    │
                    └────────┬────────┘
                         │
              ┌──────┴──────┐
              ▼            ▼
        (Yes)          (No)
          │               │
    ┌─────▼─────┐   ┌──────▼──────┐
    │  Welcome   │   │ Check Session │
    │   Pages    │   └──────┬──────┘
    └─────┬─────┘          │
          │               ┌──────┴──────┐
          ▼               │ Session OK?  │
    ┌─────▼─────┐      └──────┬──────┘
    │  PIN Setup  │         (Yes) │ (No)
    └─────┬─────┘              ▼     ▼
          │         Skip Lock   │   ┌──────▼──────┐
          ▼                    │   Lock Screen │
    ┌─────▼─────┐          │               │
    │  Main App  │◄──────────┤  Authenticate │
    └───────────┘           │               │
                              └──────► Unlock    │
                                           └──────┬──────┘
                                                  ▼
                                           ┌──────▼──────┐
                                           │   Main App   │
                                           └───────────┘
```

## User Experience Principles

1. **Progressive Disclosure**: User sees welcome → PIN → optional biometric
2. **No Interruptions**: SW registration delayed until onboarding complete
3. **Session Persistence**: Refresh doesn't lock (sessionStorage)
4. **Graceful Fallback**: Forgot PIN? Use biometric. Forgot both? Reset app.
5. **Clear Feedback**: Progress bars, toasts, and confirmation dialogs
