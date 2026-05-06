# Service Worker Versioning System

## Overview

This application uses a versioned Service Worker (SW) with a consent-based update flow. Users explicitly approve registration, download, and activation of new SW versions. No polling — updates are checked only on app load or manually via Settings.

**Note**: SW registration is **delayed until onboarding completes** (welcome pages + security setup). This prevents interrupting the user experience during first-time setup.

## Architecture

### Files

| File                               | Purpose                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/sw-template.js`               | SW template with placeholders for cache name and asset list                                                  |
| `public/generate-sw.js`            | Build script that reads `package.json` version, injects assets, writes `sw-v{version}.js` and `version.json` |
| `src/main.tsx`                     | Entry point — handles SW registration on first visit, detects version mismatches on return                   |
| `src/hooks/usePWAUpdate.tsx`       | Central hook for update state management (`idle` → `available` → `downloading`)                              |
| `src/components/UpdatePrompt.tsx`  | Global bottom-sheet dialog for SW updates with progress bar and version display                              |
| `src/components/SWProgressBar.tsx` | Full-screen progress bar shown during first-time SW installation                                             |
| `src/hooks/useSWProgress.tsx`      | Hook that tracks SW install progress for the progress bar                                                    |
| `src/hooks/usePWAVersion.ts`       | Hook to read current/latest SW version for display in UI                                                     |
| `sw.d.ts`                          | TypeScript declarations for window extensions                                                                |

### Build Output

Running `bun run build` produces:

- `dist/sw-v{version}.js` — versioned service worker file (e.g., `sw-v0.0.2.js`)
- `dist/version.json` — manifest with `{ "version": "0.0.2", "minSupportedVersion": "0.0.0", "generatedAt": "..." }`

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
    → When download complete → SKIP_WAITING sent automatically
    → controllerchange fires → page reloads
    → On reload: new SW is active, versions match → normal flow
```

### Manual Update via Settings

```
User opens Settings → App & Storage → "Update App"
  → If idle: calls checkForUpdates() → fetches version.json
  → If new version found: shows Update dialog (same as app load flow)
  → If downloading: shows progress percentage
  → If up to date: shows current version
```

### Minimum Supported Version

The app uses a `minSupportedVersion` field in `package.json` and `version.json` to enforce critical updates. Unlike a per-version `forceUpdate` flag, this approach ensures users who missed a forced version are still required to update when a newer non-forced version is released.

**How it works**:

1. Developer sets `minSupportedVersion` in `package.json` when releasing critical updates
2. Build script copies this to `version.json`
3. On app load, client compares registered version with `minSupportedVersion`
4. If registered version < `minSupportedVersion`, update is mandatory (full-screen overlay, no dismiss)
5. If registered version >= `minSupportedVersion`, update is optional (standard bottom-sheet)

**Example Scenario**:

- v1.0.5 released with `minSupportedVersion: "1.0.5"` (critical security fix)
- v1.0.6 released with `minSupportedVersion: "1.0.5"` (non-critical feature)
- User with v1.0.4 visits during v1.0.6 era → **forced to update** (because 1.0.4 < 1.0.5)
- User with v1.0.5 visits during v1.0.6 era → optional update to v1.0.6

**Developer Workflow**:

```json
// package.json
{
  "version": "1.0.5",
  "minSupportedVersion": "1.0.5"
}
```

Build and deploy. All users below v1.0.5 will be forced to update.

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
                                    (SKIP_WAITING sent)
                                    (page reloads)
```

State transitions:

- `available` → `idle`: user dismisses (if not forceUpdate)
- `downloading` → `idle`: SW download complete, auto-activates via SKIP_WAITING
- `handleReady` and `handleProgress` only affect state when already in `downloading` — this prevents first-install events from triggering the update dialog

## Events

| Event                 | Source                         | Detail                | Purpose                                            |
| --------------------- | ------------------------------ | --------------------- | -------------------------------------------------- |
| `sw-version-detected` | main.tsx                       | none                  | Signals version info is available on window object |
| `sw-update-available` | main.tsx                       | `{ version: string }` | New version detected on server, differs from local |
| `sw-progress`         | main.tsx (from SW postMessage) | `{ percent: number }` | Download progress during SW install                |
| `sw-ready`            | main.tsx                       | none                  | SW is active and controlling the page              |
| `sw-error`            | main.tsx                       | none                  | SW registration failed                             |

## Storage Keys

| Key                                     | Type                   | Purpose                                                                     |
| --------------------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `localStorage['swRegisteredVersion']`   | string (e.g., "0.0.2") | Tracks which SW version is registered. Used to detect updates.              |
| `sessionStorage['sw-dismissed-update']` | string ("true")        | Suppresses update dialog for current browser session. Cleared on tab close. |

## Window Extensions

```typescript
interface Window {
  deferredInstallPrompt: BeforeInstallPromptEvent | null
  latestSWVersion?: string // Current version from server (version.json)
  currentSWVersion?: string // Version of the active/registered SW
  swRegisteredVersion?: string // Same as localStorage value
  swAvailableVersion?: string // Pending update version
  swUpdateRequired?: boolean // Whether update is mandatory (version < minSupportedVersion)
  swMinSupportedVersion?: string // Minimum supported version from version.json
  swReady?: boolean // SW is active
  swError?: boolean // SW registration failed
}
```

## Hooks API

### usePWAUpdate()

```typescript
const {
  currentVersion, // string | null — currently registered version
  availableVersion, // string | null — version available for update
  updateStatus, // 'idle' | 'available' | 'downloading'
  progress, // number — download percentage (0-100)
  forceUpdate, // boolean — whether update is mandatory (version < minSupportedVersion)
  dismissUpdate, // () => void — dismiss the update dialog (disabled if forceUpdate)
  acceptUpdate, // () => Promise<void> — download and auto-activate the new version
  checkForUpdates, // () => Promise<void> — manually check version.json
} = usePWAUpdate()
```

### usePWAVersion()

```typescript
const {
  currentVersion, // string | null — from window.currentSWVersion or localStorage
  latestVersion, // string | null — from window.latestSWVersion
} = usePWAVersion()
```

### useSWProgress()

```typescript
const {
  progress, // number — 0-100
  status, // 'idle' | 'installing' | 'ready' | 'error'
} = useSWProgress()
```

## Key Design Decisions

1. **No polling** — Updates are checked only once on app load. The user won't be repeatedly pestered with update dialogs while using the app.

2. **Session-based dismissal** — If a user dismisses an update, it won't reappear until the next browser session (sessionStorage clears on tab close).

3. **Versioned SW filenames** — `sw-v{version}.js` instead of `sw.js` prevents the browser from auto-updating the SW silently.

4. **Implicit first-install consent** — On first visit, the SW is registered automatically. The user chose to use the app, which implies consent. Subsequent updates require explicit approval.

5. **One-click update** — Download and activation happen automatically when user clicks Update. The SW skips waiting and page reloads when ready.

6. **SWProgressBar separate from UpdatePrompt** — `SWProgressBar` shows only during the first install at the top of the screen. `UpdatePrompt` shows for subsequent updates at the bottom as a bottom sheet.

## Bumping Versions

To release a new version:

1. Bump version in `package.json`:

   ```json
   "version": "0.0.3"
   ```

2. (Optional) Set `minSupportedVersion` in `package.json` for critical updates:

   ```json
   "minSupportedVersion": "0.0.3"  // force all users below this version to update
   ```

   If not set, defaults to `"0.0.0"` (no forced updates).

3. Run `bun run build`

4. Deploy `dist/` contents to your server

The new `sw-v0.0.3.js` and `version.json` will be served. Returning users will see the update dialog on their next app load.
