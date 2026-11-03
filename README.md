# School Portal Mobile App

A React Native (Expo) mobile app for the School Portal. It uses the existing
portal backend (Express + MongoDB) and shows each user only what their role
and permissions allow. After the app is installed once, JavaScript changes
reach it over the air with EAS Update, with no reinstall.

- Language: plain JavaScript (no TypeScript)
- State: React Context and small custom hooks (no Redux)
- Networking: built-in `fetch` (no axios)
- Tokens: stored only in `expo-secure-store`

---

## What the app does

| Area | What users can do |
| --- | --- |
| Sign in | Log in, forced password change, log out, log out of all devices |
| Dashboard | Counts and recent assignments, shaped by permissions |
| Assignments | List, detail, create, edit, archive |
| Submissions | Upload a ZIP, replace the file, download, view status |
| Grading | List submissions to grade, grade form with feedback |
| Attendance | List records, mark attendance for a batch |
| Batches | List, create, edit, archive, roster and enrollment |
| Users | List, create (one-time temporary password), edit, reset password, archive |
| Roles | List roles, create or edit a role, toggle permissions |
| Profile | Account details, change password |

Menus and buttons are built from the permissions returned by the API, not
from scattered role checks.

---

## Tech stack

| Package | Version |
| --- | --- |
| Expo SDK | ~58.0.22 |
| React Native | 0.88.1 |
| React | 19.3.0 |
| React Navigation | 7 (native stack and bottom tabs) |
| expo-updates | ~58.0.20 |
| expo-secure-store, expo-document-picker, expo-file-system, expo-sharing | Expo SDK 58 versions |

Do not add native packages casually. A native package needs a new build and
reinstall (see [Releasing](#releasing-eas-build-and-eas-update)).

---

## Requirements

- Node.js 20 or newer, and npm
- Git
- Expo Go on your Android phone (or a development build)
- A free Expo account (only needed for EAS builds and updates)
- A running backend that includes the mobile auth patch (see
  [How the app talks to the backend](#how-the-app-talks-to-the-backend))

---

## Quick start (Windows, PowerShell)

```powershell
cd C:\Users\Shahbaz\Desktop\Portal\mobile-app
npm install
copy .env.example .env
```

Set the backend URL in your local `.env` file. Do not commit that file or
paste a real backend address into this README, issues, or screenshots:

```
EXPO_PUBLIC_API_URL=
```

Use a backend address reachable from the device. A physical phone generally
cannot reach a backend running at `localhost` on your computer.

Start the app:

```powershell
npx expo start -c
```

Open Expo Go on your phone and scan the QR code. The `-c` clears the cache,
which you need after any change to `.env`.

> Use `npm run android` or `npx expo start --android`.
> Do not run `npm start android`. Expo reads `android` as a folder name and fails.

### If the phone cannot connect

1. Phone and PC must be on the same Wi-Fi (not a guest network).
2. Allow the port in Windows Firewall (PowerShell as Administrator):
   ```powershell
   New-NetFirewallRule -DisplayName "Expo Metro 8081" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow
   ```
3. Set the Windows network profile to Private, not Public.
4. Use the USB cable instead (works on any network):
   ```powershell
   adb devices
   adb reverse tcp:8081 tcp:8081
   npx expo start -c --localhost
   ```
   In Expo Go choose Enter URL manually and type `exp://localhost:8081`.
5. If Expo hangs at startup on a slow connection: `npx expo start -c --offline`.

The warning "Failed to resolve the Android SDK path" is harmless when you
test on a physical phone.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start Expo |
| `npm run android` | Start Expo and open on Android |
| `npm run lint` | Check code style (must show 0 errors and 0 warnings) |
| `npm run lint:fix` | Fix simple lint problems automatically |
| `npm run check` | Quick syntax check of every source file |
| `npm run doctor` | Run `expo-doctor` health checks |

Before you push, run `npm run lint` and `npm run check`.

---

## Backend configuration

The app connects to the backend URL configured for the local development
environment or EAS build environment. The URL is public client configuration
and can be discovered in an installed app; never put credentials, tokens, or
other secrets in it. Keep real backend addresses out of this README and other
public documentation.

The backend must support the app's mobile features. Keep implementation
details and service-specific diagnostics in private project documentation.

---

## Offline and error behavior

- Opening the app without internet, with a saved session, shows the offline
  screen with a Try again button. It does not go to Login and does not clear
  the session.
- The app retries when it returns to the foreground, or when the user taps
  Try again.
- Only a real `401` or `403` from the server ends a session. Being offline,
  a timeout, or a server cold start (5xx) never signs the user out.
- Error text always comes from `src/constants/strings`. The app never shows
  the API address, endpoint paths, status codes, or raw server errors.
  The server's own message is shown only for validation errors (400, 409,
  422), a wrong password at login, and a lockout (429).
- Screens that already have data show a small offline banner and keep the
  data on screen.

---

## Splash screen

1. The native splash (set in `app.json`, brand blue with the logo) shows
   while the app starts.
2. `SplashGate` mounts the app under a full-screen overlay that looks the
   same, then hides the native splash once, on its first layout.
3. A short animation plays (glow, name, tagline, dots).
4. When the session check finishes and at least 800 ms have passed, the
   overlay fades out over 200 ms and is removed completely.
5. If the server is still slow after 8 seconds (online only), the screen
   says "Waking up the server, please wait".
6. With "Remove animations" turned on in Android Accessibility, the splash
   is shown without motion.

Timings live in `src/constants/animation.js`. Changing the native splash
image or color in `app.json` needs a new build.

---

## Project structure

```
mobile-app/
  App.js                    app root: providers, SplashGate, navigation
  app.json                  Expo config (version, runtimeVersion, updates URL)
  eas.json                  build profiles and update channels
  .env.example              copy to .env
  .github/workflows/        eas-update.yml (OTA publish on push)
  docs/                     FEATURE_MAP.md and other notes
  scripts/check-syntax.js   used by npm run check
  src/
    api/          one small file per backend area (auth, users, batches,
                  assignments, attendance, submissions, roles, permissions)
                  plus client.js, http.js, refresh.js, errors.js
    components/
      ui/         Button, Input, Card, Badge, list rows, banners
      forms/      form pieces
      lists/      list and paging pieces
      states/     loading, empty, error and offline states
      splash/     SplashGate, SplashView, SplashLogo, SplashText, PulsingDots
    config/       env.js (reads EXPO_PUBLIC_API_URL)
    constants/    app (routes, menu), endpoints, permissions, theme,
                  animation, options, session, strings/ (all text)
    context/      AuthContext, OfflineContext, ToastContext
    hooks/        useAuth, useAuthSession, useApiData, usePaginatedList,
                  useIdleTimeout, useAppState, useReduceMotion, ...
    navigation/   RootNavigator, AppStack, AppTabs
    screens/      one folder per area
    services/     secure session storage, file download
    utils/        small helpers (errors, dates, files, validators, access)
```

---

## Code rules

These keep the project easy for any beginner.

1. Plain, simple JavaScript. No clever tricks.
2. Every piece of UI is a reusable component in `src/components`. Screens
   only assemble components.
3. Nothing hard-coded. Text, colors, spacing, durations, endpoint paths,
   permission names and page sizes live in `src/constants` or `.env`.
4. One file, one job, about 120 lines at most.
5. Every file starts with a short comment saying what it does and why.
6. Every screen handles four states: loading, empty, error (with Retry),
   and success. Use the shared state components.
7. Forms validate on the device first, then show the server's message.
8. Never log tokens, passwords or personal data.
9. Animations use the built-in `Animated` API only.

---

## Add a new screen (5 steps)

1. Add the endpoint to `src/constants/endpoints.js` and write the API call
   in `src/api/<area>.js`.
2. Add the screen's text to `src/constants/strings/<area>.js`.
3. Build the screen in `src/screens/<area>/NameScreen.js` from existing
   components. Use `useApiData` or `usePaginatedList` so loading, empty,
   error and offline states come for free.
4. Add a route name in `src/constants/app.js` (`ROUTES`) and register the
   screen in `src/navigation/AppStack.js`. For a main menu entry, add one
   line to `NAV_ITEMS` in `src/constants/app.js` with the permission and
   roles that may see it.
5. Run `npm run lint` and `npm run check`, test on your phone, then push.

---

## Releasing (EAS Build and EAS Update)

Build and install the app once. After that, JavaScript changes arrive over
the air.

### Profiles and channels (`eas.json`)

| Build profile | Channel | EAS environment | Output |
| --- | --- | --- | --- |
| `development` | development | | Development client |
| `staging` | staging | preview | Installable APK |
| `production` | production | production | Installable APK |

An APK built with a profile that has no channel cannot receive updates.
Build only with `staging` or `production`.

### One-time setup

```powershell
npm install -g eas-cli
eas login
eas init
eas update:configure
```

On expo.dev, open the project and add `EXPO_PUBLIC_API_URL` to the preview and
production environments. The value is compiled into the app and is public;
never use it for credentials or secrets. Do not copy the real value into this
README.

### Build and install the APK

```powershell
eas build --platform android --profile staging
eas build --platform android --profile production
```

Open the link or QR code that EAS prints on your phone, download the APK
and install it (Android asks to allow installs from unknown sources).
iOS builds need a paid Apple developer account and are not set up.

### Publish an update (no reinstall)

```powershell
npm run lint
eas update --channel staging --environment preview --message "What changed"
eas update --channel production --environment production --message "What changed"
```

Publish to staging first and check it on a staging APK before production.
The app downloads the update on launch and applies it on the next launch.
To see it: open the app, wait a few seconds, fully close it, open it again.

### Automatic updates from GitHub

`.github/workflows/eas-update.yml` publishes on every push:

- push to `staging` branch: update on the staging channel
- push to `master` branch: update on the production channel

It runs `npm ci` and `npm run lint` first. A failing lint stops the publish.

One-time token setup:

1. On expo.dev: Account settings, Access tokens, create a token.
2. On GitHub: the repository, Settings, Secrets and variables, Actions,
   New repository secret, name `EXPO_TOKEN`, paste the token.

Never put the token in the repository.

### What needs what

| Change | How it ships |
| --- | --- |
| Screens, components, logic, text, colors, API calls | Over-the-air update |
| New native package, permissions, app name, icon, native splash image or color | New `eas build` and reinstall |
| Expo SDK upgrade | New `eas build` and reinstall |
| `version` in `app.json` | New `eas build` (see below) |

### Runtime version

`app.json` uses `runtimeVersion` with the `appVersion` policy. An update is
only delivered to builds with the same app `version`, which keeps a JavaScript
update from reaching an app build that cannot run it. Do not change
`version` for a normal update. If you bump it, installed APKs stop receiving
updates until you build and install again.

### Roll back a bad update

Open the project on expo.dev, go to Updates for the channel, and republish
the last good update. You can also use `eas update:republish` (run
`eas update:republish --help` to confirm its options).

---

## Testing checklist (on a real Android phone)

1. Normal start: the splash animates, then fades into Login or the Dashboard
   with no color flash and no blocked touches.
2. Log in as admin, teacher and student. Each sees only their own menu.
3. Wrong password shows the server's message. Too many attempts shows the
   lockout message.
4. Sign in, close the app, turn on airplane mode, open the app: the offline
   screen appears (not Login). Turn airplane mode off and tap Try again: the
   app continues, still signed in.
5. A user whose password was reset is forced to change it before continuing.
6. Student: upload a ZIP, replace it, download it. A non-ZIP or oversized
   file is rejected on the device.
7. Settings, Accessibility, Remove animations: the splash shows without motion.
8. Leave the app in the background for more than 10 minutes: it asks for
   login again.
9. Cold start with a sleeping server: "Waking up the server, please wait"
   appears after about 8 seconds, then the app continues.

---

## Known limitations

- Some screen and component files are longer than the 120-line guideline
  (for example BatchRosterScreen, UserEditScreen, AssignmentDetailScreen,
  TimeField, DateField). Splitting them is planned.
- Attendance editing, the per-student attendance summary, and per-user extra
  permissions exist in the backend but have no screens in the app. Compare
  with the web portal and add them if needed.
- Android only. iOS needs an Apple developer account and has not been built
  or tested.
- The first request after the free hosting tier sleeps can take up to a minute.

---

## Troubleshooting

| Problem | What to do |
| --- | --- |
| Login fails or data does not load | Verify privately that the deployed backend supports the mobile app's required features. |
| App says it cannot reach the server | Verify the backend URL is configured for the current environment and reachable from the device, then restart with `npx expo start -c`. |
| Update published but the phone shows the old app | Close the app fully and open it twice. Check the APK was built with `staging` or `production`, and that `version` in `app.json` has not changed. |
| Update ships with an empty API address | `EXPO_PUBLIC_API_URL` is missing in the EAS environment you published to. |
| Lint fails in GitHub | Run `npm run lint` locally and fix every warning. |