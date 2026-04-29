# Service Worker Versioning System

## Overview

This application uses a versioned Service Worker (SW) with a consent-based update flow. Users explicitly approve registration, download, and activation of new SW versions. No polling — updates are checked only on app load or manually via Settings.

**Note**: SW registration is **delayed until onboarding completes** (welcome pages + security setup). This prevents interrupting the user experience during first-time setup.

## Architecture

### Files

| File | Purpose |
|------|---------|
| `src/sw-template.js` | SW template with placeholders for cache name and asset list |
| `public/generate-sw.js` | Build script that reads `package.json` version, injects assets, writes `sw-v{version}.js` and `version.json` |
| `src/main.tsx` | Entry point — handles SW registration on first visit, detects version mismatches on return |
| `src/hooks/usePWAUpdate.tsx` | Central hook for update state management (`idle` → `available` → `downloading` → `waiting`) |
| `src/components/UpdatePrompt.tsx` | Global bottom-sheet dialog for SW updates with progress bar and version display |
| `src/components/SWProgressBar.tsx` | Full-screen progress bar shown during first-time SW installation |
| `src/hooks/useSWProgress.tsx` | Hook that tracks SW install progress for the progress bar |
| `src/hooks/useSWToasts.tsx` | Hook that shows toast notifications for SW events |
| `src/hooks/usePWAVersion.ts` | Hook to read current/latest SW version for display in UI |
| `sw.d.ts` | TypeScript declarations for window extensions |

### Build Output

Running `bun run build` produces:
- `dist/sw-v{version}.js` — versioned service worker file (e.g., `sw-v0.0.2.js`)
- `dist/version.json` — manifest with `{ "version": "0.0.2", "generatedAt": "...", "forceUpdate": false }`

No generic `sw.js` is generated. Each version has a unique URL, preventing browser auto-update behavior.

### Version Source

The SW version comes from `package.json` `"version"` field. Every time you bump the version in `package.json` and build, a new SW file is generated.

## Flow

### First Visit

```
User opens app for the first time
  → main.tsx: no localStorage['swRegisteredVersion'] found
  → main.tsx: registers sw-v{version}.js automatically (implicit consent by using the app)
  → SW installs + downloads all assets (install event fires)
  → SWProgressBar shows download progress at top of screen
  → localStorage['swRegisteredVersion'] = version
  → window.currentSWVersion = version
  → sw-version-detected + sw-ready events fire
  → No update dialog shown (this is first install, not an update)
```

### Return Visit (Same Version)

```
User opens app, server version matches localStorage version
  → main.tsx: versions match
  → main.tsx: verifies existing SW is active
  → sw-version-detected + sw-ready events fire
  → No dialog, no registration, no download
```

### Return Visit (New Version Available)

```
User opens app, server version > localStorage version
  → main.tsx: version mismatch detected
  → main.tsx: sets window.swAvailableVersion = new version
  → main.tsx: dispatches sw-update-available event
  → usePWAUpdate hook receives event → state = 'available'
  → UpdatePrompt shows: "v{old} → v{new}" with Update / Later buttons
  → User clicks "Later" or X:
    → sessionStorage['sw-dismissed-update'] = 'true'
    → Dialog dismissed, won't reappear this browser session
  → User clicks "Update":
    → State → 'downloading', progress bar appears inline
    → main.tsx registers new sw-v{version}.js
    → SW downloads all assets in background
    → Progress messages from SW → progress bar updates
    → When download complete → state → 'waiting'
    → UpdatePrompt shows: "Update Ready to Activate" with Activate / Later buttons
  → User clicks "Activate":
    → Sends SKIP_WAITING to waiting SW
    → controllerchange fires → page reloads
    → On reload: new SW is active, versions match → normal flow
```

### Manual Update via Settings

```
User opens Settings → App & Storage → "Update App"
  → If idle: calls checkForUpdates() → fetches version.json
  → If new version found: shows Update dialog (same as app load flow)
  → If downloading: shows progress percentage
  → If waiting: shows "Tap to activate vX.X.X"
  → If up to date: shows current version
```

### Force Update

When `version.json` has `"forceUpdate": true`:
- The Update/Later buttons are hidden
- The X (dismiss) button is hidden
- User cannot dismiss the dialog
- Set `forceUpdate: true` in `public/generate-sw.js` before building when you need to force an update

## State Machine

```
┌───────┐   sw-update-available    ┌───────────┐
│ idle  │ ────────────────────────►│ available │
└───────┘                           └─────┬─────┘
                                          │ acceptUpdate()
                                          ▼
                                    ┌─────────────┐
                                    │ downloading │
                                    └──────┬──────┘
                                           │ sw-ready (100%)
                                           ▼
                                     ┌───────────┐
                                     │  waiting  │
                                     └─────┬─────┘
                                           │ activateUpdate()
                                           ▼
                                    (page reloads)
```

State transitions:
- `available` → `idle`: user dismisses (if not forceUpdate)
- `downloading` → `waiting`: SW download complete (sw-ready event at 100%)
- Any state → `idle`: only from user dismiss on `available` or `waiting`
- `handleReady` and `handleProgress` only affect state when already in `downloading` — this prevents first-install events from triggering the update dialog

## Events

| Event | Source | Detail | Purpose |
|-------|--------|--------|---------|
| `sw-version-detected` | main.tsx | none | Signals version info is available on window object |
| `sw-update-available` | main.tsx | `{ version: string }` | New version detected on server, differs from local |
| `sw-progress` | main.tsx (from SW postMessage) | `{ percent: number }` | Download progress during SW install |
| `sw-ready` | main.tsx | none | SW is active and controlling the page |
| `sw-error` | main.tsx | none | SW registration failed |

## Storage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `localStorage['swRegisteredVersion']` | string (e.g., "0.0.2") | Tracks which SW version is registered. Used to detect updates. |
| `sessionStorage['sw-dismissed-update']` | string ("true") | Suppresses update dialog for current browser session. Cleared on tab close. |

## Window Extensions

```typescript
interface Window {
  deferredInstallPrompt: BeforeInstallPromptEvent | null
  latestSWVersion?: string          // Current version from server (version.json)
  currentSWVersion?: string         // Version of the active/registered SW
  swRegisteredVersion?: string      // Same as localStorage value
  swAvailableVersion?: string       // Pending update version
  swForceUpdate?: boolean           // Whether update is mandatory
  swReady?: boolean                 // SW is active
  swError?: boolean                 // SW registration failed
}
```

## Hooks API

### usePWAUpdate()

```typescript
const {
  currentVersion,       // string | null — currently registered version
  availableVersion,     // string | null — version available for update
  updateStatus,         // 'idle' | 'available' | 'downloading' | 'waiting'
  progress,             // number — download percentage (0-100)
  forceUpdate,          // boolean — whether dialog is dismissible
  dismissUpdate,        // () => void — dismiss the update dialog
  acceptUpdate,         // () => Promise<void> — download the new version
  activateUpdate,       // () => void — activate the waiting SW (triggers reload)
  checkForUpdates,      // () => Promise<void> — manually check version.json
} = usePWAUpdate()
```

### usePWAVersion()

```typescript
const {
  currentVersion,   // string | null — from window.currentSWVersion or localStorage
  latestVersion,    // string | null — from window.latestSWVersion
} = usePWAVersion()
```

### useSWProgress()

```typescript
const {
  progress,   // number — 0-100
  status,     // 'idle' | 'installing' | 'ready' | 'error'
} = useSWProgress()
```

## Key Design Decisions

1. **No polling** — Updates are checked only once on app load. The user won't be repeatedly pestered with update dialogs while using the app.

2. **Session-based dismissal** — If a user dismisses an update, it won't reappear until the next browser session (sessionStorage clears on tab close).

3. **Versioned SW filenames** — `sw-v{version}.js` instead of `sw.js` prevents the browser from auto-updating the SW silently.

4. **Implicit first-install consent** — On first visit, the SW is registered automatically. The user chose to use the app, which implies consent. Subsequent updates require explicit approval.

5. **Two-phase update** — Download (`acceptUpdate`) and activation (`activateUpdate`) are separate. The user can download in the background and choose when to activate (reload).

6. **SWProgressBar separate from UpdatePrompt** — `SWProgressBar` shows only during the first install at the top of the screen. `UpdatePrompt` shows for subsequent updates at the bottom as a bottom sheet.

## Bumping Versions

To release a new version:

1. Bump version in `package.json`:
   ```json
   "version": "0.0.3"
   ```

2. (Optional) Set `forceUpdate: true` in `public/generate-sw.js`:
   ```js
   forceUpdate: true,  // make this non-dismissible
   ```

3. Run `bun run build`

4. Deploy `dist/` contents to your server

The new `sw-v0.0.3.js` and `version.json` will be served. Returning users will see the update dialog on their next app load.
