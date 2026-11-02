# School Portal Mobile - Feature Map

Status: Draft for approval. No mobile screens will be built until this file is approved.

Date: 2026-11-02
Backend source: `C:\Users\Shahbaz\Desktop\Portal\PORTAL-backend`
Web source: `C:\Users\Shahbaz\Desktop\Portal\PORTAL-frontend`
New app: `C:\Users\Shahbaz\Desktop\Portal\mobile-app`

---

## 1. Goal

Build a React Native (Expo) app for Android and iOS that covers every existing portal feature for admin, teacher, student, and any custom role, using the existing backend and permission system. The app is JavaScript only, beginner-friendly, and split into small reusable components.

Non-negotiables:

- Expo latest stable, JavaScript (no TypeScript).
- React Navigation. Reason: explicit stack/tab guards are easier to teach and audit than file-based routing.
- Built-in `fetch` only. No Axios, Redux, React Query, or token libraries.
- Tokens in `expo-secure-store` only.
- No hard-coded colors, spacing, text, endpoints, permissions, or config.
- Every screen has loading, empty, error-with-Retry, and success states.
- Every file gets a 2-3 line header comment, stays near 120 lines, and gets device-side validation plus server error display.
- Never log tokens, passwords, or full auth headers.

---

## 2. Verified backend facts that drive the screens

### 2.1 Response shapes

- `docs/API.md` says only `GET /health` uses `{ success, data }`.
- Feature endpoints return the resource, array, or object directly.
- Errors always return `{ success: false, error, details? }`.
- List endpoints return an array plus headers `X-Page`, `X-Page-Limit`, `X-Total-Count`.
- Pagination defaults: `page=1`, `limit=50`, max `limit=100`.
- This differs from the assumption that all responses use `success/data`; the app will follow the verified direct responses.

### 2.2 Authentication and sessions

- Login sets httpOnly cookies `portal_access` and `portal_refresh`.
- `Authorization: Bearer <access>` is already accepted by the backend.
- Access token default lifetime: 10 minutes. Refresh token: 7 days. Idle timeout: 10 minutes.
- Refresh rotates the refresh token and detects reuse.
- Every unsafe request (`POST`, `PUT`, `PATCH`, `DELETE`) requires header `x-csrf-protection: 1`, including login, refresh, and logout.
- `GET /api/auth/me` returns the current user with fresh permissions.
- `mustChangePassword` is enforced by middleware: every route except `POST /api/auth/change-password` returns `403` with the exact message `You must change your password before continuing.`
- `toSafeUser()` does not return `mustChangePassword`, so login cannot detect the forced-change state directly.
- The web app checks `user.mustChangePassword` after login, but that field is never present. Its real fallback is the 403 interceptor. This is an existing frontend inconsistency.
- No backend dashboard endpoint exists.

### 2.3 Permissions and scoping

Permissions (21): `dashboard.view`, `students.view`, `students.create`, `students.update`, `students.attendance`, `batches.view`, `batches.create`, `batches.update`, `batches.delete`, `batches.enroll`, `assignments.view`, `assignments.create`, `assignments.update`, `assignments.delete`, `submissions.view`, `submissions.grade`, `attendance.view`, `attendance.manage`, `users.manage`, `roles.manage`, `profile.view`.

- Admin: all permissions.
- Teacher: dashboard, profile, student view/create, own batches, own assignments, own submissions, own attendance, grading.
- Student: dashboard, profile, own assignments, own submissions, own attendance.
- `students.update` and `students.attendance` exist but no route currently uses them. They remain selectable in role editing for compatibility.
- Teachers are limited by backend queries to their own batches and students; students are limited to their own records.
- Custom roles get permissions from the role plus per-user extra permissions.

### 2.4 API coverage

Every existing endpoint is covered by this plan:

| Domain | Endpoints | Mobile surface |
| --- | --- | --- |
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/logout-all`, `/change-password`; `GET /auth/me` | Login, Bootstrap, Session layer, Profile, Forced change, User create |
| Users | `GET /users`, `PATCH /users/:id`, `PATCH /users/:id/archive`, `PATCH /users/:id/reset-password`, `DELETE /users/:id` | Users list, User create, User edit, Credentials, actions |
| Batches | `GET /batches`, `GET /batches/:id/students`, `POST /batches`, `PATCH /batches/:id`, `PATCH /batches/:id/archive`, `DELETE /batches/:id`, `POST /batches/:id/enroll` | Batches list, Batch form, Batch roster/enroll |
| Assignments | `GET /assignments`, `GET /assignments/:id`, `POST /assignments`, `PATCH /assignments/:id`, `DELETE /assignments/:id` | Assignments list, detail, form, archive |
| Attendance | `GET /attendance`, `GET /attendance/:studentId`, `POST /attendance`, `PATCH /attendance/:id` | Attendance list, mark, edit, summary |
| Submissions | `GET /submissions`, `POST /submissions`, `PATCH /submissions/:id/file`, `GET /submissions/:id/download`, `PATCH /submissions/:id/grade` | Submissions list, upload/replace, download, grading |
| Permissions | `GET /permissions`, `PATCH /permissions/users/:id` | Role permission catalog, User edit extra permissions |
| Roles | `GET /roles`, `POST /roles`, `PATCH /roles/:id`, `DELETE /roles/:id` | Roles list, Role form, delete |

### 2.5 Existing inconsistencies to handle, not silently change

1. `mustChangePassword` is not in login or `/me` user shape but blocks all other routes.
   - Decision: after login and on app start, call `/auth/me` as a probe. A 403 with the exact message opens Forced Change Password. A 200 opens the app with fresh permissions.
   - No change to `toSafeUser()` is required.
2. API docs describe `DELETE /users/:id` and `DELETE /batches/:id` as soft delete, but routes also expose `PATCH /:id/archive`, and the web app uses archive.
   - Decision: use `PATCH .../archive` for "Archive" and `DELETE` for "Delete permanently". Both endpoints exist and are permission-protected.
3. API docs say resubmission must be allowed, but `submissionUploadService.updateSubmission` does not check `assignment.resubmissionPolicy`.
   - Decision: the mobile UI hides replacement when policy is `disabled`; no backend behavior change in this work.
4. Web grading is numeric 0-100 only, but the API accepts letter grades and `status: rejected`.
   - Decision proposed: support numeric 0-100 plus a letter/short text grade, and a Graded/Rejected status. Flagged for approval in section 9.
5. Web attendance is Present/Absent only, but the API supports `leave`, editing a record, and a per-student summary.
   - Decision proposed: mark Present/Absent/Leave, allow staff to edit a record, and show summary. Flagged in section 9.
6. Web users navigation is admin-only, but teachers have `students.view` and `students.create` and the backend scopes them to their own students.
   - Decision: show a Students screen to teachers, with create enabled and management actions hidden unless `users.manage`.
7. Web assignment form only sends four fields, but the API accepts `allowedFileTypes`, `maxFileSizeMb`, `resubmissionPolicy`, and (on update) `active`.
   - Decision: expose these in an Advanced section so mobile users can control upload limits and resubmission. Flagged in section 9.
8. `GET /roles` returns `{ roles, permissions }`, not a paginated array. Roles are not paginated.
9. `GET /attendance/:studentId` returns a summary object, not a list.
10. User creation passwords are generated by the web client. Mobile will generate a 16-character password with `expo-crypto` and show it once.

---

## 3. Mobile architecture decisions

### 3.1 Navigation

- Root: `NavigationContainer`.
- Unauthenticated stack: Login.
- Password-change stack: Forced Change Password.
- Authenticated tabs, built from visible permissions:
  - Dashboard (`dashboard.view`)
  - Assignments (`assignments.view`)
  - Submissions (`submissions.view`)
  - Attendance (`attendance.view`)
  - More (always visible)
- More screen lists: Grading (`submissions.grade`), Batches (`batches.view`), Students/Users (`students.view` or `users.manage`), Roles & Permissions (`roles.manage`), Profile (`profile.view`), Sign out.
- Stack screens: Assignment Detail, Assignment Form, Submission Upload, Grade Form, Batch Form, Batch Roster, User Create, User Edit, Attendance Mark, Attendance Edit, Attendance Summary, Role Form.
- If a user lacks a tab permission, that tab is not rendered. More remains so Profile and Sign out are always reachable.

### 3.2 Source layout

```text
mobile-app/
  App.js
  app.json / app.config.js
  eas.json
  .env.example
  docs/
  src/
    api/            auth, users, batches, assignments, attendance, submissions, roles, permissions
    components/     ui, lists, forms, states, navigation
    config/         env
    constants/      colors, spacing, text, endpoints, permissions, options
    context/        AuthContext, ToastContext
    hooks/          useApi, usePaginatedList, useDebouncedValue, useAppState
    navigation/     RootNavigator, AuthNavigator, AppTabs, MoreStack
    screens/        auth, dashboard, assignments, submissions, grading, attendance, batches, users, roles, profile, more
    services/       session (SecureStore), upload, download, error mapping
    utils/          ids, dates, validators, permissions, formatters
```

### 3.3 Dependencies (proposed)

- `expo`, `react`, `react-native`, `expo-status-bar`
- `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- `react-native-screens`, `react-native-safe-area-context`
- `expo-secure-store` (tokens)
- `expo-document-picker` (ZIP selection)
- `expo-file-system` (download write)
- `expo-sharing` (share downloaded ZIP)
- `expo-crypto` (random password generation)
- `expo-clipboard` (copy one-time credentials)
- `expo-updates` (EAS Update, last step)
- No icon library is required; simple text/icon glyphs or built-in symbols can be used. If icons are added, use `@expo/vector-icons` which ships with Expo.

### 3.4 API client behavior

- Base URL from `EXPO_PUBLIC_API_URL`, no trailing slash, LAN IP for local device testing.
- Send `Accept: application/json`.
- Send `x-csrf-protection: 1` on every unsafe method.
- Send `Authorization: Bearer <access>` on every request when a token exists.
- Parse errors from `error`, `details`, or a generic network message.
- 401 flow: try `POST /auth/refresh` once with `{ refreshToken }`; on success replace both tokens, replay the original request once, and never loop. On failure clear tokens and return to Login.
- Forced-password 403: clear only the current screen state and navigate to Forced Change Password; do not clear tokens.
- Multipart upload: build `FormData` with `assignmentId` and a `{ uri, name, type }` file object. No upload percentage because `fetch` does not report progress; show an indeterminate progress state.
- Download: fetch the authorized download URL with Bearer, convert the response to a file, save in cache, then open the share sheet via `expo-sharing`.

---

## 4. Backend mobile support patch (must be done first)

Minimal, backward-compatible changes in `PORTAL-backend`:

1. `POST /api/auth/login`
   - When request header `x-client: mobile` is present, include `accessToken` and `refreshToken` in the JSON body in addition to cookies.
   - When absent, response stays exactly `{ user }`.
2. `POST /api/auth/refresh`
   - When `x-client: mobile` is present, include the rotated `accessToken` and `refreshToken` in the body.
   - When absent, response stays exactly `{ user }`.
3. `POST /api/auth/refresh` and `POST /api/auth/logout`
   - Accept the refresh token from JSON body `refreshToken` as a fallback when the cookie is missing.
   - Cookie must still take precedence.
   - Invalid body token must produce the same safe 401 response as an invalid cookie.
4. Tests to add:
   - Mobile login returns both tokens and still sets cookies.
   - Web login returns no tokens.
   - Mobile refresh returns rotated tokens.
   - Refresh with body token works without a cookie.
   - Logout with body token revokes only that session.
   - Cookie behavior remains unchanged.
5. Documentation: add a "Mobile clients" section to `PORTAL-backend/docs/API_CHANGES.md` with exact headers, body fields, and security notes. Do not log tokens.
6. Verification: run `npm test` and `npm run lint` in `PORTAL-backend` and show real output.

No CORS, cookie, token-lifetime, or permission changes.

---

## 5. Cross-cutting mobile behavior

- Bootstrap on launch: load tokens from SecureStore. If none, show Login. If present, probe `GET /auth/me`. On success, cache the user and permissions. On 401, attempt one refresh then retry. On failed refresh, clear all tokens and show Login.
- Permissions are read from the latest `/auth/me`, login, or refresh user object. UI gates are convenience only; the backend remains authoritative.
- 10-minute inactivity: track foreground activity with throttled touches and `AppState`. If the app returns after 10+ minutes, clear tokens and show Login.
- Pull to refresh on every list and detail screen.
- Pagination: page size 50 (max 100). Show "Showing X of Y" from headers and a Load more button when loaded < total. Reset to page 1 on search/filter changes.
- Server search is used where supported: users, batches, assignments. Submissions, attendance, roles, and dashboard queues use client-side filtering of loaded rows.
- IDs: use `item._id || item.id` everywhere; auth `/me` returns `id`.
- Dates: format with device locale. Send ISO strings to the API. Date-only attendance uses local calendar day, not UTC midnight display.
- Empty, loading, error, success are implemented per screen with shared state components. Errors include Retry.
- Destructive actions always confirm: archive user, archive batch, delete batch, archive assignment, delete role, reset password, sign out everywhere.
- One-time passwords and credentials are shown once, copied only by explicit user action, and never logged or saved.

---

## 6. Screen specifications

### 6.1 Bootstrap / Splash

- Access: public.
- Actions: read SecureStore, probe `/auth/me`, refresh once if needed.
- Success: route to tabs or forced change.
- Error: route to Login with a session-expired note.
- States: loading only; no raw error screen.

### 6.2 Login

- Access: public.
- API: `POST /auth/login` with `{ email, password }`, `x-client: mobile`, CSRF header.
- Fields: email, password. Validate email shape and non-empty password.
- On success: save tokens, set user, probe `/auth/me`; 403 forced message goes to Forced Change Password, otherwise Dashboard.
- Errors: 401 "Invalid email or password", 429 rate limit, network message. No account enumeration beyond server text.
- States: loading button, inline field errors, page error, success navigation.

### 6.3 Forced Change Password

- Access: authenticated but blocked by backend until changed.
- API: `POST /auth/change-password` with current and new password.
- Fields: current, new, confirm. Minimum 8 characters, confirm must match, new must differ from current per server.
- Success: clear form, call `/auth/me`, replace route with tabs.
- Also reachable from Profile? No. Profile has its own change form.
- Errors: inline field errors, server error alert. Sign out is available.

### 6.4 Dashboard

- Access: `dashboard.view`.
- Data:
  - Assignments: `GET /assignments?limit=5&page=1` if `assignments.view`.
  - Submissions: `GET /submissions?limit=5&page=1` if `submissions.view`.
  - Batches: `GET /batches?limit=5&page=1` if `batches.view` and staff.
- Content: greeting, date, stat cards (open assignments, awaiting grading or in progress, active batches for staff), attention queue, shortcuts.
- Student queue: open assignments sorted by due date, show due date and batch.
- Staff queue: submissions whose status is not graded, show learner, assignment, batch, status.
- Missing permissions: hide the related section instead of calling a forbidden endpoint.
- States: section-level loading, page error with Retry, empty queue message, success.
- Pull to refresh.

### 6.5 Assignments List

- Access: `assignments.view`.
- API: `GET /assignments?page&limit&search&batchId`.
- Backend scoping: student gets active, not-yet-due assignments in enrolled batches; teacher gets owned batches; admin gets all.
- UI: search, batch filter (staff with `batches.view`), cards with title, batch, due date, status, description preview.
- Actions:
  - Create if `assignments.create`.
  - Edit if `assignments.update`.
  - Archive if `assignments.delete` (confirm; calls `DELETE /assignments/:id`).
- Pagination and pull to refresh.
- States: loading skeleton, empty with role-specific text, error Retry, success.

### 6.6 Assignment Detail

- Access: `assignments.view`.
- API: `GET /assignments/:id`; students additionally load `GET /submissions?assignmentId=<id>&limit=100` and use their own record.
- Display: title, description, batch, due date, open/expired/closed status, submission limits, resubmission policy, creator.
- Student:
  - Show their submission file name, submitted date, grade, feedback, status.
  - Upload if no submission and assignment open.
  - Replace if submission exists, assignment open, and policy is `allowed`.
  - Download their file.
- Staff:
  - Show submission window and shortcuts to Submissions/Grading.
  - Edit/archive shortcuts if permitted.
- Error handling: 410 means closed; show closed state with no upload controls. 404 show missing state.
- States: loading, not found, error Retry, success.

### 6.7 Assignment Form (create/edit)

- Access: `assignments.create` or `assignments.update`.
- APIs: `GET /batches?limit=100` for options; `POST /assignments`; `PATCH /assignments/:id`.
- Fields:
  - Required: title, batch, due date/time.
  - Optional: description.
  - Advanced: `maxFileSizeMb` (1-250, default 25), `resubmissionPolicy` (`allowed`/`disabled`), `allowedFileTypes` fixed to `zip` (read-only), `active` toggle on edit only.
- Validation: title max 160, description max 5000, due date valid ISO, batch required, max file size integer 1-250.
- Teacher: batch options are their own active batches; backend enforces ownership.
- Success: return to list/detail and refresh.
- States: loading options, error Retry, saving, inline errors, success toast.

### 6.8 Submissions List

- Access: `submissions.view`.
- API: `GET /submissions?page&limit` and optionally `assignmentId`.
- Backend scoping: student own, teacher owned batches, admin all.
- UI: search by learner/assignment/status/feedback on loaded rows, status filter (all, submitted, graded, rejected), cards with learner, assignment link, batch, submitted date, status, grade, feedback preview, file action.
- Student: "Upload submission" action.
- Staff: "Open grading" shortcut; grade action only if `submissions.grade`.
- Download uses the authorized endpoint.
- Pagination, pull to refresh, 4 states.

### 6.9 Submission Upload / Replace

- Access: student with `submissions.view`.
- APIs:
  - `GET /assignments?limit=100` for open assignments.
  - `GET /submissions?assignmentId=<id>&limit=100` to detect an existing submission.
  - `POST /submissions` (create) or `PATCH /submissions/:id/file` (replace), multipart with `assignmentId` and `file`.
- Selection: `expo-document-picker`, ZIP only.
- Device validation: `.zip` extension and allowed MIME type, file size <= assignment `maxFileSizeMb` and the 50 MB global cap, assignment active and not past due, replacement only when policy allows. Warn that replacement overwrites and resets grade/feedback.
- Errors: no file, too large, wrong type, expired (410), already submitted (409), network.
- States: picking, uploading (indeterminate), success refresh, error inline, 4 states for assignment list.

### 6.10 Grading List

- Access: `submissions.grade`.
- API: `GET /submissions?page&limit`.
- Backend scoping: admin all, teacher owned batches.
- UI: filter all / needs review / graded, search learner/assignment/feedback, cards with learner, assignment, batch, status, grade, submitted date.
- Actions: open Grade Form.
- Pagination, pull to refresh, 4 states.

### 6.11 Grade Form

- Access: `submissions.grade`.
- API: `PATCH /submissions/:id/grade` with `{ grade, feedback, status }`.
- Fields: grade (required), feedback (optional, max 2000), status (`graded` or `rejected`).
- Validation: numeric grades 0-100; letter/short text grade max 10 and non-empty. Status default `graded`.
- Note: web only uses numeric 0-100 and `graded`; the wider input matches the API. Flagged for approval.
- Success: refresh grading list and show toast.
- States: loading record context, saving, inline errors, success.

### 6.12 Attendance List

- Access: `attendance.view`.
- API: `GET /attendance?page&limit&batchId&date&studentId`.
- Student: request with own `studentId`; show own history and a summary card from `GET /attendance/:studentId`.
- Staff: show register across owned batches, filters by batch and date, search loaded rows by learner/batch/status.
- Row/card: learner, email, batch, date, status badge.
- Staff actions:
  - Mark attendance if `attendance.manage`.
  - Edit record if `attendance.manage`.
  - View student summary.
- Pagination, pull to refresh, 4 states.

### 6.13 Mark Attendance

- Access: `attendance.manage`.
- APIs:
  - `GET /batches?limit=100` for owned/active batches.
  - `GET /batches/:id/students?limit=100` for roster.
  - `GET /attendance?batchId&date&limit=100` for existing records.
  - `POST /attendance` per student with `{ studentId, batchId, date, status }` (upsert).
- UI: choose batch, choose date (not future), load roster, set each student Present/Absent/Leave, save all.
- Initial state: existing record status if present, otherwise Absent.
- Validation: batch required, date not future, roster non-empty.
- Errors: partial save failure shown with retry; already-saved records are safe because the endpoint upserts.
- Note: web supports Present/Absent only; Leave is added to match the API. Flagged for approval.
- States: batches loading, roster loading, empty roster, save progress, error, success.

### 6.14 Edit Attendance

- Access: `attendance.manage`.
- API: `PATCH /attendance/:id` with `{ status, date }`.
- UI: status selector Present/Absent/Leave, date picker not future.
- Note: not exposed in the web UI; added to cover the API endpoint. Flagged for approval.
- States: saving, inline error, success refresh.

### 6.15 Attendance Summary

- Access: `attendance.view`.
- API: `GET /attendance/:studentId`.
- Student: own summary card and record list.
- Staff: open from an attendance row or batch roster to view that student's summary.
- Display: present count, total, percentage, records with date/batch/status.
- States: loading, empty records, error Retry, success.

### 6.16 Batches List

- Access: `batches.view`.
- API: `GET /batches?page&limit&search`.
- Scoping: admin all active batches; teacher own active batches; students are not given this screen.
- UI: search, cards with name, teacher name/email, student count.
- Actions:
  - Create if `batches.create`.
  - Edit if `batches.update`.
  - Archive if `batches.delete` (confirm; `PATCH /batches/:id/archive`).
  - Delete permanently if `batches.delete` (confirm; `DELETE /batches/:id`; server returns 409 when history exists).
  - Manage roster/enroll if `batches.enroll` or `batches.view`.
- Pagination, pull to refresh, 4 states.

### 6.17 Batch Form

- Access: create `batches.create`, edit `batches.update`.
- APIs: `GET /users?role=teacher&limit=100` for admin teacher options; `POST /batches`; `PATCH /batches/:id`.
- Fields: name required, max 120; teacher required for admin; teacher is fixed to self for teacher users.
- Success: refresh list and show toast.
- States: loading teachers, error Retry, saving, inline errors.

### 6.18 Batch Roster / Enrollment

- Access: `batches.view` for roster; `batches.enroll` for enrollment.
- APIs:
  - `GET /batches/:id/students?page&limit`.
  - `POST /batches/:id/enroll` with `{ studentId }`.
  - `GET /users?role=student&limit=100` for the picker (teacher results are scoped by backend).
- UI: batch summary, searchable student roster, enroll action, tap a student to open Attendance Summary when allowed.
- Enrollment duplicate is safe (upsert). Server errors shown.
- Pagination, 4 states.

### 6.19 Users / Students List

- Access: `students.view` or `users.manage`.
- API: `GET /users?page&limit&search&role`.
- Scoping: teacher sees active students in owned batches only; admin sees all.
- UI: search name/email/role, role filter (admin), cards with name, email, role, active/archived status.
- Actions:
  - Create account if `students.create`.
  - Edit if `users.manage`.
  - Reset password if `users.manage`.
  - Activate/deactivate if `users.manage`.
  - Archive/restore if `users.manage`.
  - Delete permanently if `users.manage` (server returns 409 when history exists).
- Pagination, pull to refresh, 4 states.
- Note: teachers see this screen even though the web sidebar hides it, because the backend explicitly supports teacher student management.

### 6.20 User Create

- Access: `students.create`.
- API: `POST /auth/register` with name, email, role, generated password, optional batchId.
- Fields:
  - Name required, max 100.
  - Email required, valid, unique.
  - Role required. Admin: core roles plus active custom roles from `GET /roles` when allowed; teacher: student only.
  - Optional batch for students, from readable batches, when `batches.view`; backend also checks enrollment permission.
  - Password generated on device with `expo-crypto`: 16 characters with upper, lower, digit, special.
- Permissions and `active` are not set at creation; manage them in User Edit.
- Success: show credentials once in a modal with copy action, refresh list, clear password from state on close.
- Errors: 409 duplicate email, 403 role restriction, 400 validation, network.
- States: loading roles/batches, saving, inline errors, credentials shown once.

### 6.21 User Edit

- Access: `users.manage`.
- APIs: `PATCH /users/:id`; `PATCH /permissions/users/:id` for extra permissions if needed; `GET /permissions` optionally.
- Fields:
  - Name, email, role, active.
  - Extra permissions (additive on top of role) from constants or `GET /permissions`.
  - No password field; use Reset Password instead.
- Restrictions shown in UI: cannot change own role, cannot deactivate self; server also enforces.
- Success: refresh list, toast. Role or active changes revoke that user's sessions on the server.
- States: loading, saving, inline errors, success.

### 6.22 Reset Password / Credentials

- Access: `users.manage`.
- API: `PATCH /users/:id/reset-password`.
- Confirmation required. Server generates a 12-character temporary password, sets forced change, and revokes sessions.
- Show once in a modal with copy; never store in AsyncStorage.
- Errors: self-reset not allowed, network.
- States: confirming, loading, credentials, error.

### 6.23 Roles List

- Access: `roles.manage`.
- API: `GET /roles` returns `{ roles, permissions }`; `GET /permissions` returns catalog and defaults. No pagination.
- UI: search role name/label/permission, cards with core/custom badge, permission summary.
- Actions: create, edit, delete (custom roles only; backend blocks core and roles with users).
- States: loading, empty, error Retry, success.
- Note: `active` is not exposed because `GET /roles` returns only active roles, so deactivating would make a custom role disappear from the only list. Delete is the supported UI path.

### 6.24 Role Form

- Access: `roles.manage`.
- APIs: `GET /permissions` catalog; `POST /roles`; `PATCH /roles/:id`; `DELETE /roles/:id`.
- Fields:
  - Name: create only, lowercase letters/numbers/hyphen/underscore, max 50.
  - Label: required, max 100.
  - Permissions: grouped toggles for all 21 permissions.
- Core roles: name fixed; edit label and permissions; delete disabled.
- Custom roles: create/edit/delete; delete blocked when users are assigned.
- States: catalog loading, saving, inline errors, success.

### 6.25 Profile

- Access: `profile.view`.
- APIs: `GET /auth/me`, `POST /auth/change-password`, `POST /auth/logout-all`.
- Display: name, email, role label, active status, permission count or list, session note.
- Change password form: current, new, confirm; 8+ characters, confirm match.
- Sign out everywhere: confirm, call `/auth/logout-all`, clear SecureStore, return to Login. Backend revokes all sessions including current.
- Normal Sign out lives in More and Profile.
- States: form loading, inline errors, success, sign-out loading.

### 6.26 More

- Access: authenticated.
- Content: permission-filtered links to Grading, Batches, Students/Users, Roles & Permissions, Profile; app version; normal Sign out.
- Sign out: call `/auth/logout` with `{ refreshToken }` and `x-client: mobile`; clear tokens even if the request fails, then show Login.
- States: static list; sign-out loading/error toast.

---

## 7. Validation summary

- Email: non-empty and basic email shape.
- Password: required; new passwords 8-128 characters; confirm match.
- Name: required, max 100.
- Batch name: required, max 120.
- Assignment title: required, max 160; description max 5000; due date valid and ISO.
- Assignment file size: integer 1-250 MB; file type fixed to ZIP.
- Attendance: batch and date required; date not in the future; status one of present/absent/leave.
- Grade: required; numeric 0-100 or short letter/text max 10; feedback max 2000.
- Upload: `.zip` only; allowed MIME type; size <= assignment max and 50 MB global; assignment open; policy check for replacement.
- Role: name pattern on create, label required; permission values restricted to the 21 constants.
- All server `details` arrays are joined into readable messages.

---

## 8. Acceptance criteria

- All 25 surfaces above exist and are reachable according to permissions.
- Admin, teacher, and student demo accounts can complete their real workflows against the existing backend.
- Every list supports loading, empty, error Retry, success, pull to refresh, and pagination.
- No request is sent without CSRF header on unsafe methods.
- Access token refresh happens once, never loops, and logs out on failure.
- Forced password change works for a reset account.
- ZIP upload, replacement, download, and grading work on a physical Android device; iOS paths are implemented against the same APIs.
- Tokens never appear in logs, AsyncStorage, screenshots of debug output, or error messages.
- The backend mobile patch is covered by tests and `npm test` plus `npm run lint` are shown.
- `docs/API_CHANGES.md` documents the mobile token contract.
- EAS staging/production channels and GitHub Action are configured last and verified with a real update.

---

## 9. Decisions requested before building

Please approve or change these. Defaults below are recommended.

1. Response shape: follow verified `API.md` direct responses, not a universal `success/data` envelope. Default: direct.
2. Forced password detection: probe `/auth/me` after login/start and use the exact 403 message. Default: yes; no backend user-shape change.
3. Backend patch: add `x-client: mobile` token body support and body refresh token for refresh/logout. Default: yes.
4. Grading: support API letter grades and `rejected` status in addition to numeric 0-100. Default: yes. Choose "web parity" if you want numeric-only.
5. Attendance: support Leave, edit existing records, and summaries in addition to the web's Present/Absent mark flow. Default: yes. Choose "web parity" for Present/Absent only.
6. Assignment form: expose `maxFileSizeMb`, `resubmissionPolicy`, and edit-time `active` in an Advanced section. Default: yes. Choose "web parity" for title/description/batch/due date only.
7. Users screen for teachers: show it based on `students.view`, not admin role alone. Default: yes.
8. User creation: support optional batch enrollment and generated 16-character password. Default: yes.
9. Archive vs delete: use `PATCH /archive` for archive, `DELETE` for permanent delete, as the web app does. Default: yes.
10. Testing: use a real Android device over LAN HTTP during development, and HTTPS for production. Default: yes.

After approval, the work order is:

1. Backend mobile patch + tests + `API_CHANGES.md`.
2. Expo scaffold, config, constants, API client, auth/session, navigation.
3. Screens by domain, starting with auth, dashboard, assignments, submissions.
4. Attendance, batches, users, roles, profile.
5. Device testing and bug fixes.
6. EAS build/update and GitHub Action.
