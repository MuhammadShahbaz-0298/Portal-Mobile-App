# School Portal Mobile

React Native (Expo) app for the existing school portal backend. It supports
admin, teacher, student, and custom roles, and shows screens based on the
permissions returned by the API.

- JavaScript only (no TypeScript)
- React Navigation for stacks and tabs
- Built-in `fetch` (no Axios, Redux, or React Query)
- Tokens stored only in `expo-secure-store`
- EAS Build for one-time installs and EAS Update for over-the-air changes

See `docs/FEATURE_MAP.md` for every screen and endpoint, and
`docs/PROGRESS.md` for what is done and what remains.

## Requirements

- Node.js 20 or newer
- A phone on the same Wi-Fi as this computer (for local testing)
- The backend running locally on port 5000
- An Expo account for builds and updates (free to start)

## Install

Open PowerShell in this folder (`C:\Users\Shahbaz\Desktop\Portal\mobile-app`).

```powershell
npm install
Copy-Item .env.example .env
```

Then edit `.env` and set your computer's LAN IP:

```
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

A phone cannot reach `localhost`, because `localhost` means the phone itself.
Find the computer's IPv4 address with:

```powershell
ipconfig
```

Look for `IPv4 Address` under your Wi-Fi adapter. Allow the port through the
Windows Firewall (run PowerShell as Administrator, once):

```powershell
New-NetFirewallRule -DisplayName "Portal API 5000" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

When Windows asks whether Node.js may use the network, allow private networks.

## Run

```powershell
npm start
```

Scan the QR code with Expo Go, or press `a` to open an Android emulator.
The backend must be running and the phone and computer must be on the same
Wi-Fi.

## Test and check

```powershell
npm run lint     # ESLint (Expo config)
npm run check    # Babel syntax check for every app file
npm run doctor   # Expo project health check
```

The backend has its own checks:

```powershell
cd ..\PORTAL-backend
npm test
npm run lint
```

## How to add a new screen (5 steps)

1. Add any new API path to `src/constants/endpoints.js`, and any new text to
   `src/constants/strings.js`. Nothing user-visible should be hard-coded in a
   screen.
2. Add a small function in the matching file under `src/api/` (for example
   `src/api/batches.js`). Use the shared `apiClient`; never call `fetch`
   directly from a screen.
3. Create the screen under `src/screens/<area>/`. Wrap it in `Screen`, use the
   shared `LoadingState`, `EmptyState`, `ErrorState` (with Retry), and build it
   from `src/components/` pieces. Keep the file near 120 lines.
4. Add the route name to `src/constants/app.js` (`ROUTES`).
5. Register the screen in `src/navigation/RootNavigator.js` (or as a tab in
   `src/navigation/AppTabs.js`, or a link in `src/screens/MoreScreen.js`).
   Guard it with the right permission from `src/constants/permissions.js`.

Run `npm run lint` and `npm run check` after adding a screen.

## Releasing

OTA updates let you ship JavaScript changes without reinstalling the app.
Native changes still need a new build.

### When you need a NEW BUILD

Build again when you change anything that is compiled into the app:

- A new native package, or an Expo package with native code was added
- Android/iOS permissions or other native settings in `app.json`
- The Expo SDK version
- The app name, icon, splash screen, package name, or bundle identifier
- Anything covered by `runtimeVersion` (see below)

### When an OTA UPDATE is enough

Any change that is only JavaScript or assets:

- Screens, components, text, colors, spacing
- API calls, validation, or business logic
- Images and fonts bundled by Metro

### How `runtimeVersion` prevents bad updates

Each installed build advertises a runtime version. Every update is published
for a runtime version. A phone only downloads an update that matches its own
runtime version, so new JavaScript is never loaded into an incompatible native
build. This project uses `{"policy": "appVersion"}`, so a different
`version` in `app.json` starts a new runtime version.

### One-time EAS setup (needs your Expo account)

Run these yourself; nobody needs your password, and `eas login` is interactive.

```powershell
npm install --global eas-cli
eas login
eas init
eas update:configure
```

`eas init` links the project and adds `extra.eas.projectId`.
`eas update:configure` adds `updates.url` to `app.json`. Both are required
before updates work. This wiring is NOT YET DONE in this workspace.

Set the API URL for each EAS environment (never hard-code it):

1. Open expo.dev, then your project, then Environment variables.
2. Add `EXPO_PUBLIC_API_URL` for the `staging` environment (your staging API).
3. Add `EXPO_PUBLIC_API_URL` for the `production` environment (your HTTPS API).

`eas.json` already points the staging and production profiles at those
environments.

### Build the app (install once)

```powershell
npx eas build --platform android --profile staging
npx eas build --platform android --profile production
```

EAS prints a download link when the build finishes. Open the link on the
Android phone and install the APK (allow "install unknown apps" for the
browser). iOS builds need a paid Apple Developer account and are skipped
unless requested.

### Publish an OTA update

```powershell
npx eas update --channel staging --message "Fix login text"
npx eas update --channel production --message "Release 1.0.1"
```

The app checks for updates on launch, downloads them in the background, and
applies them on the next launch. To test: change a visible text, publish to
staging, fully close the app, open it, close it again, and open it once more.
The new text appears.

### Roll back a bad update

```powershell
npx eas update:rollback
```

The interactive guide lets you re-publish a previous update, or go back to the
update embedded in the installed build. Afterwards, publishing again sends the
new update to all clients.

### GitHub Action

`.github/workflows/eas-update.yml` publishes automatically:

- Push to the `staging` branch -> staging channel
- Push to the `main` branch -> production channel
- It runs `npm ci` and `npm run lint` first, so a failing lint stops the publish

Create the token once:

1. Open expo.dev, then Account settings, then Access tokens.
2. Create a token and copy it.
3. In GitHub: repository Settings > Secrets and variables > Actions >
   New repository secret. Name it `EXPO_TOKEN` and paste the token.
4. Never commit the token. It lives only in GitHub secrets.

## Project layout

```
mobile-app/
  App.js                 app root (providers + navigator)
  app.json               Expo config (name, icons, runtimeVersion)
  eas.json               build/update profiles
  .env.example           API URL example (copy to .env)
  docs/
    FEATURE_MAP.md       every screen, endpoint, permission
    PROGRESS.md          done / remaining checklist
  .github/workflows/     automated EAS updates
  scripts/check-syntax.js
  src/
    api/                 one file per backend area + shared client
    components/          reusable UI, list cards, loading/empty/error states
    screens/             one folder per area
    hooks/               useAuth, useApiData, usePaginatedList, ...
    context/             AuthContext, ToastContext
    constants/           endpoints, permissions, strings, theme, options
    utils/               dates, files, validators, errors, ids
```
