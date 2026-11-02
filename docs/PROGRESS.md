# Mobile App Progress

Last updated: 2026-11-02
This file is the running checklist for the school-portal mobile app. It records
what is done, what is left, and what could not be verified. Keep it current.

Legend: DONE = built and verified as noted. REMAINING = still to do.
BLOCKED / NOT TESTED = cannot verify here; steps are written down.

---

## Verified baseline (run on 2026-11-02)

- `PORTAL-backend`: `npm run lint` -> pass (no output = clean).
- `PORTAL-backend`: `npm test` -> 58 tests, 58 pass, 0 fail (includes the new
  `tests/mobileAuth.test.js`).
- `mobile-app`: `node scripts/check-syntax.js` -> 106 files, no syntax errors.
- `mobile-app`: `npm run lint` -> exit 0 (8 advisory `exhaustive-deps` warnings).
- `mobile-app`: `npx expo export --platform android` -> exported `dist`
  successfully (1079 modules).
- `mobile-app`: `npx expo-doctor` -> 20/20 checks passed.
- `mobile-app`: React Navigation, built-in fetch, SecureStore, and all required
  Expo packages verified via `npm ls`.
- Hard-coded audit: no sentence-like UI text or hex/rgba colors found in
  `src/screens` or `src/components`. Raw `fontSize: 16` found in
  `src/components/ui/Input.js:84` and `src/components/ui/SearchBar.js:47`
  (needs moving to theme constants).
- Installed Expo packages: expo 58.0.22, react-native 0.88.1, expo-updates
  58.0.20, expo-secure-store 58.0.2, expo-document-picker 58.0.4,
  expo-file-system 58.0.13, expo-sharing 58.0.21, expo-crypto 58.0.7,
  @react-navigation/native 7.5.1.

---

## Done

### Planning
- [x] `docs/FEATURE_MAP.md` written (563 lines) covering API facts, screens,
      permissions, decisions, acceptance criteria.

### Backend patch (`PORTAL-backend`)
- [x] `x-client: mobile` returns `accessToken` + `refreshToken` on login and
      refresh; web response unchanged.
- [x] Refresh/logout accept `refreshToken` from the JSON body when the cookie
      is absent (`utils/cookies.js`).
- [x] Tests added: `tests/mobileAuth.test.js` (mobile login/refresh/logout
      with `x-client: mobile`; web without header unchanged) plus header support
      in `tests/helpers/integration.js`. `npm test` -> 60/60 pass.
- [x] Documented in `docs/API_CHANGES.md` section 18.
- [x] `npm test` and `npm run lint` pass (see baseline above).
- NOTE: backend changes are uncommitted. Prompt says commit per area; this was
      not committed yet.

### App foundation
- [x] Expo SDK 58 JS project, React Navigation (stack + tabs).
- [x] `src/config/env.js`, constants (`app`, `theme`, `endpoints`, `permissions`,
      `options`, `strings`).
- [x] `src/api/client.js`: base URL, CSRF header, single-flight refresh-once,
      forced-password detection, Bearer token.
- [x] `src/context/AuthContext.js`, `ToastContext`, `expo-secure-store` session.
- [x] Shared UI/state components (`components/ui`, `components/states`,
      `components/lists`).
- [x] Navigation guards by permission (`RootNavigator`, `AppTabs`, `MoreScreen`).
- [x] `npm run check` syntax script (`scripts/check-syntax.js`).

### Features (screens exist for every FEATURE_MAP surface)
- [x] Auth: Splash/Bootstrap, Login, Forced Change Password.
- [x] Dashboard (permission-aware counts, quick actions, recent assignments).
- [x] Assignments: list, detail, create/edit, delete/archive.
- [x] Submissions: list, ZIP upload/replace, download, grade form, grading list.
- [x] Attendance: list, mark, edit, per-student summary.
- [x] Batches: list, form, roster/enrollment, archive/delete.
- [x] Users/Students: list, create (generated password, one-time credentials),
      edit, reset password, archive/delete.
- [x] Roles: list, form with permission toggles, delete custom roles.
- [x] Profile: details, change password, logout, logout-all. (Note: Profile
      still missing "sign out everywhere" action, active status row, session
      note per audit X-13.)
- [x] More: permission-filtered menu, sign out.
- Note: on-device run against a live backend is NOT TESTED in this session.

### Deployment config (mostly done)
- [x] `app.json` has `runtimeVersion: { policy: "appVersion" }`.
- [x] `eas.json` staging/production channels; both Android profiles build an
      installable APK. API URLs come from EAS environments (`environment` key),
      never hard-coded.
- [x] `expo-updates` installed.
- [x] Mobile lint: added `eslint.config.js` + `eslint`, `eslint-config-expo`
      dev deps and `npm run lint` / `npm run lint:fix` scripts.
      `npm run lint` exits 0 (8 advisory `exhaustive-deps` warnings remain).
- [x] `.github/workflows/eas-update.yml`: staging branch -> staging channel,
      main branch -> production channel; runs `npm ci` + `npm run lint` first;
      uses `EXPO_TOKEN`.
- [x] `README.md`: install, run, test, add-a-screen (5 steps), Releasing
      (new build vs OTA, runtimeVersion, rollback, Windows LAN IP + firewall),
      EAS setup, GitHub token steps.

---

## Remaining

### 1. EAS project + OTA wiring (BLOCKED: needs `eas login`)
- [ ] Run `eas init` and `eas update:configure` (requires Expo account).
      This adds `updates.url` and `extra.eas.projectId` to `app.json`.
      Currently MISSING, so OTA cannot work until this is run.
- [ ] Add `EXPO_PUBLIC_API_URL` for the `staging` and `production` EAS
      environments in expo.dev.
- [ ] One-time builds (staging/production APK), install on device.
- [ ] OTA update test on staging: NOT TESTED (no Expo account/build here).

### 2. Code-rule cleanup
- [x] Split `src/constants/strings.js` (was 564 lines) into 12 domain files
      under `src/constants/strings/`; `strings.js` is now a barrel. All imports
      unchanged. Largest new file is 95 lines.
- [ ] Files still over ~120 lines need splitting (rule 4):
      UserEditScreen (296), BatchRosterScreen (257),
      AssignmentDetailScreen (230), AssignmentFormScreen (211),
      DashboardScreen (204), AttendanceScreen (196), AttendanceMarkScreen (189),
      UserCreateScreen (184), SubmissionUploadScreen (179), AuthContext (171),
      RootNavigator (166), RoleFormScreen (165), api/client (164),
      SubmissionsScreen (162), UsersScreen (153), ProfileScreen (149),
      MoreScreen (147), AssignmentsScreen (145), GradeFormScreen (143).
- [ ] Audit for hard-coded UI strings/colors that should live in constants.

### 3. Device testing
- [ ] Run app on a physical Android device against the local backend over LAN.
      NOT TESTED here.

---

## Changes made this session

- Added `eslint.config.js`; added `eslint` + `eslint-config-expo` dev deps;
  added `lint` / `lint:fix` scripts.
- Fixed React ref writes during render in `useApiData` and `usePaginatedList`
  by syncing refs in effects (lint `react-hooks/refs`).
- Removed unused catch bindings in `api/client.js`, `AuthContext.js`,
  `services/session.js`.
- Turned off the React-Compiler-only `react-hooks/set-state-in-effect`
  advisory in the lint config (compiler is not enabled).
- Split `constants/strings.js` into 12 files under `constants/strings/` with a
  barrel; imports unchanged.
- `eas.json`: production profile now `distribution: internal` + APK.
- Added `.github/workflows/eas-update.yml`.
- Added `README.md` (install, run, test, add screen, Releasing).
- Added this `PROGRESS.md`.

Notes:
- `mobile-app` is not a git repository, so nothing was committed. Backend
  changes are also uncommitted (`git status` shows 4 modified + 1 new test).
- No commits or pushes were made (not explicitly requested).

---

## How to verify the missing/blocked items

1. Lint: `cd mobile-app; npm run lint` (already passes locally).
2. EAS project wiring: `cd mobile-app; npx eas login; npx eas init;
   npx eas update:configure`. Then confirm `app.json` has `updates.url` and
   `extra.eas.projectId`.
3. Set EAS env vars: in expo.dev -> Project -> Environment variables, add
   `EXPO_PUBLIC_API_URL` for the `staging` and `production` environments.
4. Build: `npx eas build --platform android --profile staging`
   then install the APK from the link EAS prints.
5. OTA: change a visible text, `npx eas update --channel staging
   --message "test"`, reopen the installed app twice (updates apply on the
   next launch).
6. GitHub: create `EXPO_TOKEN` at expo.dev -> Account settings -> Access
   tokens, add it as a repo secret, push to `staging` or `main`.
