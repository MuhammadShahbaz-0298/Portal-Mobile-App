# Mobile App Progress

Last updated: 2026-11-03

This file records what is verified, what is blocked, and what still needs a
manual check. A feature is only marked DONE when it produced real output.

Legend: DONE = run and verified. BLOCKED = cannot run here.
NOT TESTED = no run yet; steps are written down.

---

## Verified on 2026-11-03 (Windows + Android phone, Expo Go)

- `npm run lint` -> 0 errors, 0 warnings.
- `npm run check` -> 121 files, no syntax errors.
- `npx expo-doctor` -> 20/20 checks passed.
- `npx expo export --platform android` -> exported `dist`, 1098 modules.
- On-device login against the deployed HTTPS API -> success; the dashboard
  loaded for the admin account.
- On-device Submissions tab -> renders all rows, status badges
  (`Submitted`, `Graded`), download and grade actions; no crash.
- Safe area on device -> tab headers start at y=103 on a screen whose status
  bar is 71 px tall, so content no longer draws under the notification bar.
  Stack headers also start below the status bar.
- Running Metro bundle check -> contains the deployed API URL, no removed
  server-waking banner, no API-URL text in user-facing copy.

## DONE

### App foundation
- Expo SDK 58, JavaScript only, React Navigation stack + bottom tabs.
- Shared `Screen` shell with safe area, keyboard handling, scroll, and pull to
  refresh.
- Built-in `fetch` client with CSRF header, `x-client: mobile`, single-flight
  refresh-once, forced-password handling, and 10-minute idle timeout.
- Tokens only in `expo-secure-store`.
- Permission-aware navigation and role checks in `src/utils/access.js`.

### Screens
- Auth: splash/bootstrap, login, forced change password.
- Dashboard: counts, attention queue, shortcuts.
- Assignments: list, detail, create/edit, archive.
- Submissions: list, ZIP upload/replace, download, grading, grade form.
- Attendance: list and mark register.
- Batches: list, create/edit, roster, enrollment, archive.
- Users: list, create, edit, reset password, archive/restore.
- Roles: list, create/edit, delete custom roles.
- Profile and More: account details, change password, sign out.

### Copy and configuration
- All user-facing text lives in `src/constants/strings/`.
- Colors, spacing, sizes, limits, endpoints, and permissions live in
  `src/constants/`.
- Server-waking banner and its timer removed; no API-URL or environment text
  appears in the app.
- `.env.example` points at the deployed API and explains the local LAN option.

### API verification (local backend, throwaway records)
- Read: login, me, roles, permissions, users, batches, assignments, submissions,
  attendance.
- Write: create student, batch, enrollment, assignment, attendance.
- Upload: ZIP `201`; duplicate `409`; grade `95`; download `200` with `PK`.
- Filters: attendance by batch/student/date; assignments by batch;
  submissions by assignment.
- Roles: create, update, delete.
- Users: update, reset password, forced change-password flow, archive.
- Batches: update, archive.
- Assignments: update `resubmissionPolicy`, archive.
- Closed/expired assignment -> `410`; duplicate submission -> `409`.
- Reset password -> temporary password, blocked API until changed, change
  password -> normal access.

Cleanup: the QA batch and student were archived. One attendance record and one
submission remain because the API has no delete endpoint for them. No Render
data was created or changed during testing.

## BLOCKED

- Native splash visual proof: Expo Go does not show the built splash. Needs an
  installed APK.
- EAS environment variables: needs an interactive `eas login`.
- OTA publish/proof: needs an installed staging build and `eas update`.
- Backend-only issue: with `resubmissionPolicy = "disabled"` the backend still
  accepts `PATCH /api/submissions/:id/file`. The mobile UI blocks it before
  sending. Backend is read-only for this task.

## NOT TESTED

- Refresh-once after 401 with real expiry: needs about 11 minutes of continuous
  use. Steps: sign in, wait for the access token to expire, open a data screen;
  the app should refresh once, retry once, and only sign out if refresh fails.
- Render cold-start experience on a sleeping free instance: first request can
  take up to about a minute; timeout is 90 s.

## How to verify the blocked/untested items

1. Native splash: `npx eas build --platform android --profile staging`, install
   the APK, then launch it.
2. EAS setup:
   `npm install --global eas-cli; eas login; eas init; eas update:configure`.
3. EAS env:
   `eas env:set --environment preview --name EXPO_PUBLIC_API_URL --value "https://backend-58gd.onrender.com" --visibility plaintext`
   and the same for `production`.
4. OTA: change a visible text, `npx eas update --channel staging --environment preview --message "test"`,
   close the installed app, open it, close it, open it again.
5. Refresh-once: sign in, wait 11+ minutes, open a data screen, confirm the
   screen reloads instead of logging out.
6. Backend resubmission rule: covered by backend tests, not by this app.
