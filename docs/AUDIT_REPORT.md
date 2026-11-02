# Mobile App Audit Report

Date: 2026-11-03  
Scope: `mobile-app` checked against `mobile-app/docs/FEATURE_MAP.md`, `PORTAL-backend/docs/API.md`, `PORTAL-backend/docs/ARCHITECTURE.md`, `PORTAL-backend/docs/SECURITY.md`, `PORTAL-backend/docs/CODING_RULES.md`, `PORTAL-backend/config/permissions.js`, `PORTAL-backend/docs/API_CHANGES.md`.  
Status: Audit complete. **No fixes were made yet.** Approval is required before Part 2 or Part 3.  
Read-only audit: nothing in either repository was modified.

## Method

- Read every file under `mobile-app/src` (api, components, config, constants, context, hooks, navigation, screens, services, utils).
- Read `mobile-app/App.js`, `index.js`, `app.json`, `eas.json`, `package.json`, `eslint.config.js`, `README.md`, `.gitignore`, `.env.example`, `scripts/check-syntax.js`.
- Read `mobile-app/docs/FEATURE_MAP.md` and `mobile-app/docs/PROGRESS.md`.
- Read backend `docs/API.md`, `ARCHITECTURE.md`, `SECURITY.md`, `CODING_RULES.md`, `config/permissions.js`, `docs/API_CHANGES.md`.
- Read backend `app.js`, `routes/auth.js`, `controllers/authController.js`, `utils/cookies.js`, `constants/index.js`, `constants/auth.js`, `middleware/csrf.js`, `middleware/auth.js`, `routes/submissions.js`, `services/submissionService.js`, `services/assignmentService.js`.
- Read backend `tests/auth.test.js` and the new `tests/mobileAuth.test.js`.
- Confirmed `.env` does NOT exist in mobile-app (only `.env.example`). Confirmed `.env` is NOT in `.gitignore`.
- **Commands actually run (real output below):**
  - `npm run lint` in mobile-app → exit 0, 8 `exhaustive-deps` warnings, 0 errors
  - `npm run lint` in PORTAL-backend → exit 0, clean
  - `npm test` in PORTAL-backend → 60/60 pass (54 original + 6 new mobile auth tests)
  - `npx expo-doctor` in mobile-app → 20/20 passed
- Did NOT run the app against a live backend (no device/simulator run).
- Did NOT verify git branch name or `git status` for `app.json`.

---

## Real check output (run once, below)

### `npm run lint` — mobile-app

```
> school-portal-mobile@1.0.0 lint
> expo lint

env: load .env
env: export EXPO_PUBLIC_API_URL

C:\Users\Shahbaz\Desktop\Portal\mobile-app\src\hooks\useApiData.js
  47:22  warning  React Hook useEffect has a spread element in its dependency array. This means we can't statically verify whether you've passed the correct dependencies  react-hooks/exhaustive-deps

C:\Users\Shahbaz\Desktop\Portal\mobile-app\src\screens\assignments\AssignmentDetailScreen.js
  57:8  warning  React Hook useCallback has missing dependencies: 'canSubmissions', 'canView', 'detail', 'isStudent', and 'submissions'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\Shahbaz\Desktop\Portal\mobile-app\src\screens\attendance\AttendanceScreen.js
  55:8  warning  React Hook useCallback has a missing dependency: 'list'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\Shahbaz\Desktop\Portal\mobile-app\src\screens\batches\BatchesScreen.js
  34:8  warning  React Hook useCallback has a missing dependency: 'list'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\Shahbaz\Desktop\Portal\mobile-app\src\screens\grading\GradingScreen.js
  43:8  warning  React Hook useCallback has a missing dependency: 'list'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\Shahbaz\Desktop\Portal\mobile-app\src\screens\roles\RolesScreen.js
  31:8  warning  React Hook useCallback has a missing dependency: 'roles'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\Shahbaz\Desktop\Portal\mobile-app\src\screens\submissions\SubmissionsScreen.js
  44:8  warning  React Hook useCallback has a missing dependency: 'list'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\Shahbaz\Desktop\Portal\mobile-app\src\screens\users\UsersScreen.js
  46:8  warning  React Hook useCallback has a missing dependency: 'list'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

✖ 8 problems (0 errors, 8 warnings)
```

Exit code: 0. Per project rule, the 8 warnings are treated as **FAIL** (fix planned).

### `npm run lint` — PORTAL-backend

```
> school-portal-backend@1.0.0 lint
> eslint .
```

No output. Exit code: 0. Result: **PASS**.

### `npm test` — PORTAL-backend

```
> school-portal-backend@1.0.0 test
> node --test tests/*.test.js

✔ login sets httpOnly cookies and never returns a token
✔ refresh rotates the token and replay revokes the whole family
✔ an expired access token is rejected
✔ the server enforces the idle timeout
✔ a disabled user is rejected immediately
✔ logout revokes the server session and clears cookies
✔ login is locked after ten failures
✔ unsafe requests without the CSRF header are rejected
✔ changing the password revokes the other sessions
✔ accepts a complete, safe environment
✔ refuses to start when a required variable is missing
✔ refuses a JWT secret that is too short
✔ refuses a JWT secret that looks like an example
✔ refuses a JWT secret with too few different characters
✔ refuses invalid database and frontend addresses
✔ refuses an invalid port
✔ refuses an access token that lives longer than the idle timeout
✔ reads token times from the environment
✔ production cookies are cross-site safe
✔ mobile login returns accessToken and refreshToken and still sets cookies
✔ web login returns no tokens in the body
✔ mobile refresh returns rotated accessToken and refreshToken
✔ mobile refresh works with body token and no cookie
✔ mobile logout accepts body token and revokes the session
✔ mobile invalid body token returns 401 same as invalid cookie
✔ an admin reset returns a 12-character temporary password and flags the user
✔ the temporary password works for login
✔ resetting a password revokes that user's existing sessions
✔ a user with a temporary password is blocked from every other route
✔ changing the password clears the block
✔ an admin cannot reset their own password this way
✔ a non-admin cannot reset another user's password
✔ resetting an unknown user returns 404
✔ teacher B cannot read or change teacher A's batches and students
✔ attendance can only be managed for an owned batch
✔ a teacher cannot grade another teacher's submission
✔ a student cannot read another student's attendance
✔ teachers may register students only in their own batches
✔ enrolling in a new batch keeps the student's other enrollments
✔ archiving a batch preserves history and permanent deletion is blocked
✔ deactivation, archive, and permanent user deletion are distinct
✔ permanent user deletion is blocked when historical records are linked
✔ permanent deletion removes an unused batch but protects batches with history
✔ admins can delete unused custom roles but cannot delete core or assigned roles
✔ recognizes a real ZIP signature
✔ accepts a small normal archive
✔ rejects an archive that expands too much
✔ rejects a high compression ratio
✔ rejects unsafe paths inside the archive
✔ rejects an archive with too many entries
✔ stored paths cannot escape the upload folder
✔ validation helpers accept valid values and reject invalid values
✔ real booleans are required, so Boolean('false') bugs cannot happen
✔ NoSQL operators are rejected anywhere in the body
✔ user text is escaped before it becomes a regex
✔ grades allow letters but cap numeric marks at 0-100
✔ mass assignment is stopped by picking allowed fields
✔ pagination has safe defaults and a hard maximum
✔ error normalization maps common persistence failures
✔ permission normalization keeps valid values and drops stale entries

ℹ tests 60
ℹ pass 60
ℹ fail 0
```

Exit code: 0. Result: **PASS**. (6 new `tests/mobileAuth.test.js` cases added and passing.)

### `npx expo-doctor` — mobile-app

```
Running 20 checks on your project...
20/20 checks passed. No issues detected!
```

Result: **PASS**.

---

## Final Counts (recomputed from table rows)

Every item originally marked "PARTIAL", "PARTIAL FAIL", or "NOT USED" has been re-classified into PASS / FAIL / NOT TESTED.

| Section | Items | PASS | FAIL | NOT TESTED |
|---|---|---|---|---|
| B1 API correctness | 56 | 49 | 6 | 1 |
| B2 Feature coverage | 17 | 15 | 2 | 0 |
| B3 Security | 8 | 7 | 0 | 1 |
| B4 Code rules | 16 | 11 | 5 | 0 |
| B5 Deployment setup | 15 | 9 | 4 | 2 |
| B6 Run it for real | 9 | 3 | 1 | 5 |
| X Additional issues | 20 | 1 | 19 | 0 |
| **Total** | **141** | **95** | **37** | **9** |

Re-classification notes:
- B1-8, B1-13, B1-20: "PARTIAL FAIL" → **FAIL**
- B2-13: "PARTIAL" → **FAIL** (static permission constants instead of `GET /permissions`)
- B5-4: "PARTIAL" → **PASS** (staging and production profiles exist)
- B1-34: "NOT USED" → **FAIL** (real gap: static permissions used instead of catalog API)
- B1-40: "NOT USED" → **NOT TESTED** (`GET /health` not required by FEATURE_MAP)

---

## B1. API correctness

| ID | Check | Result | Evidence (file:line) | Fix needed |
|---|---|---|---|---|
| B1-1 | `POST /api/auth/login` with `x-client: mobile` | PASS | `src/api/client.js:40-49` adds `x-client: mobile` + CSRF on POST; `src/api/auth.js:5-13`; backend `controllers/authController.js:22-36` returns tokens when `x-client: mobile` | None |
| B1-2 | `POST /api/auth/refresh` with body refresh token | PASS | `src/api/client.js:77-114` sends `{ refreshToken }`; backend `utils/cookies.js:44-55` falls back to body token | None |
| B1-3 | `POST /api/auth/logout` with body refresh token | PASS | `src/api/auth.js:28-36`; `client.js:40-49` adds CSRF + `x-client: mobile` | None |
| B1-4 | `POST /api/auth/logout-all` used | PASS | `src/api/auth.js:38-43`; `AuthContext.js:141-150` | None |
| B1-5 | `GET /api/auth/me` session probe | PASS | `src/api/auth.js:15-18`; `AuthContext.js:64` probes `/me` with `skipForcedHandler: true` | None |
| B1-6 | `POST /api/auth/change-password` used | PASS | `src/api/auth.js:20-26`; `ForceChangePasswordScreen.js:47`; `ProfileScreen.js:58` | None |
| B1-7 | `POST /api/auth/register` used | PASS | `src/api/auth.js:45-51`; `UserCreateScreen.js:96` | None |
| B1-8 | `GET /api/users` with search/role/page/limit | FAIL | `UsersScreen.js:38` passes only `{ role }`, not debounced `search`; client-side filtering only (`:63-71`). Backend supports `search` (`API.md:245`). | Pass debounced `search` to API, reset to page 1 |
| B1-9 | `PATCH /api/users/:id` used | PASS | `src/api/users.js:13-19`; `UserEditScreen.js:110` | None |
| B1-10 | `PATCH /api/users/:id/archive` used | PASS | `src/api/users.js:21-26`; `UserEditScreen.js:138` | None |
| B1-11 | `PATCH /api/users/:id/reset-password` used | PASS | `src/api/users.js:32-37`; `UserEditScreen.js:147` | None |
| B1-12 | `DELETE /api/users/:id` used | PASS | `src/api/users.js:39-44`; `UserEditScreen.js:144` | None |
| B1-13 | `GET /api/batches` with search/page/limit | FAIL | `BatchesScreen.js:29` passes `{}` (no `search`); client-side filtering only (`:37-45`). Backend supports `search` (`API.md:318`). | Pass debounced `search` to API |
| B1-14 | `POST /api/batches` used | PASS | `src/api/batches.js:20-26`; `BatchFormScreen.js:64` | None |
| B1-15 | `PATCH /api/batches/:id` used | PASS | `src/api/batches.js:28-34`; `BatchFormScreen.js:63` | None |
| B1-16 | `PATCH /api/batches/:id/archive` used | PASS | `src/api/batches.js:36-41`; `BatchRosterScreen.js:97` | None |
| B1-17 | `DELETE /api/batches/:id` used | PASS | `src/api/batches.js:43-48`; `BatchRosterScreen.js:100` | None |
| B1-18 | `POST /api/batches/:id/enroll` used | PASS | `src/api/batches.js:50-56`; `BatchRosterScreen.js:80` | None |
| B1-19 | `GET /api/batches/:id/students` used | PASS | `src/api/batches.js:13-18`; `BatchRosterScreen.js:55-60` | None |
| B1-20 | `GET /api/assignments` with page/limit/search/batchId | FAIL | `DashboardScreen.js:37` uses `limit: 1` instead of `limit: 5` per spec (`FEATURE_MAP.md:245`). `AssignmentsScreen.js:38-42` correctly passes search/batchId. | Use `limit=5` on dashboard |
| B1-21 | `GET /api/assignments/:id` used | PASS | `src/api/assignments.js:13-16`; `AssignmentDetailScreen.js:46` | None |
| B1-22 | `POST /api/assignments` used | PASS | `src/api/assignments.js:18-24`; `AssignmentFormScreen.js:124` | None |
| B1-23 | `PATCH /api/assignments/:id` used | PASS | `src/api/assignments.js:26-32`; `AssignmentFormScreen.js:123` | None |
| B1-24 | `DELETE /api/assignments/:id` used (as archive) | PASS | `src/api/assignments.js:34-39`; `AssignmentDetailScreen.js:78` maps to DELETE via `archiveAssignment` | None |
| B1-25 | `GET /api/attendance` with page/limit/batchId/date/studentId | PASS | `src/api/attendance.js:6-11`; `AttendanceScreen.js:44` | None |
| B1-26 | `POST /api/attendance` used | PASS | `src/api/attendance.js:13-19`; `AttendanceMarkScreen.js:97` | None |
| B1-27 | `PATCH /api/attendance/:id` used | PASS | `src/api/attendance.js:21-27`; `AttendanceEditScreen.js:42` | None |
| B1-28 | `GET /api/attendance/:studentId` used | PASS | `src/api/attendance.js:29-32`; `AttendanceSummaryScreen.js:23` | None |
| B1-29 | `GET /api/submissions` with page/limit/assignmentId | PASS | `src/api/submissions.js:7-12`; `SubmissionsScreen.js:39` | None |
| B1-30 | `POST /api/submissions` multipart upload | PASS | `src/api/submissions.js:14-28` builds FormData with `assignmentId` and `file`; `SubmissionUploadScreen.js:96` | None |
| B1-31 | `PATCH /api/submissions/:id/file` multipart replace | PASS | `src/api/submissions.js:30-43`; `SubmissionUploadScreen.js:96` calls `replaceSubmission` when `mine` exists | None |
| B1-32 | `GET /api/submissions/:id/download` with Bearer token | PASS | `src/services/download.js:15-42` fetches with `Authorization: Bearer`; one refresh on 401 | None |
| B1-33 | `PATCH /api/submissions/:id/grade` used | PASS | `src/api/submissions.js:45-51`; `GradeFormScreen.js:78` | None |
| B1-34 | `GET /api/permissions` catalog used | FAIL | `PermissionChecklist.js:6-10` and `RoleFormScreen.js:18-23` use static constants from `src/constants/permissions.js`, not `GET /permissions`. `UserEditScreen.js:59` calls it (admin-only). | Fetch catalog from `GET /permissions` |
| B1-35 | `PATCH /api/permissions/users/:id` used | PASS | `src/api/permissions.js:13-19`; `UserEditScreen.js:124` | None |
| B1-36 | `GET /api/roles` used | PASS | `src/api/roles.js:5-11`; `RolesScreen.js:26`; `UserCreateScreen.js:28`; `UserEditScreen.js:56` | None |
| B1-37 | `POST /api/roles` used | PASS | `src/api/roles.js:13-19`; `RoleFormScreen.js:75` | None |
| B1-38 | `PATCH /api/roles/:id` used | PASS | `src/api/roles.js:21-27`; `RoleFormScreen.js:70` | None |
| B1-39 | `DELETE /api/roles/:id` used | PASS | `src/api/roles.js:29-34`; `RoleFormScreen.js:94` | None |
| B1-40 | `GET /health` used | NOT TESTED | `ENDPOINTS.health` defined (`endpoints.js:5`) but never called. Not required by FEATURE_MAP. | None required |
| B1-41 | `ENDPOINTS.submissions.byId` dead endpoint | FAIL | `endpoints.js:46` defines `byId` but backend `routes/submissions.js:20-38` has no `GET /submissions/:id` route | Remove `ENDPOINTS.submissions.byId` |
| B1-42 | Feature endpoints return resource directly (not envelope) | PASS | `client.js:178` returns `{ data, meta }`; matches `API.md:54-55` and `FEATURE_MAP.md:33-38` | None |
| B1-43 | Error shape `{ success: false, error, details? }` parsed | PASS | `client.js:162-166` reads `data?.error`/`data?.details`; `utils/errors.js:9-11` joins details | None |
| B1-44 | Server error messages shown | PASS | `getErrorMessage` used in every catch block; `FormError`/`InfoBanner` display server text | None |
| B1-45 | Pagination from headers `X-Page`, `X-Page-Limit`, `X-Total-Count` | PASS | `client.js:51-57`; `usePaginatedList.js:44`; `ListFooter.js:13` | None |
| B1-46 | `x-csrf-protection: 1` on every POST/PUT/PATCH/DELETE | PASS | `client.js:36-48` — `isUnsafe` adds CSRF header | None |
| B1-47 | `x-client: mobile` sent where backend patch needs it | PASS | `client.js:40-44`; backend `authController.js:22-36` checks header | None |
| B1-48 | 401 flow: refresh ONCE, retry ONCE, then log out — no loop | PASS | `client.js:151-159` (retry flag); `refreshAccessToken()` single-flight (`:78-113`); failure clears tokens (`:104-107`) | None |
| B1-49 | 403 forced-password forces Change Password screen | PASS | `errors.js:12-18` `isForcedPasswordError`; `client.js:167-169` `onForcedPassword`; `AuthContext.js:51-54`; `RootNavigator.js:59` | None |
| B1-50 | `mustChangePassword` users cannot reach other screens | PASS | `RootNavigator.js:57-59` — `forcePassword` returns only `ForceChangePasswordScreen` | None |
| B1-51 | Idle timeout/logout (10 min background) | PASS | `AuthContext.js:22, 89-105` — `AppState`, `IDLE_LIMIT_MS = 10 min`, `logout()` | None |
| B1-52 | ZIP-only multipart upload with device validation | PASS | `utils/files.js:12-36` — `.zip` extension, MIME, `MAX_FILE_MB` (50 MB) cap; `SubmissionUploadScreen.js:84-91` | None |
| B1-53 | Assignment `maxFileSizeMb` enforced on device | FAIL | `utils/files.js:26` checks only global 50 MB; `SubmissionUploadScreen.js:77,136` displays but never compares against `current.maxFileSizeMb` | Enforce `file.size <= maxFileSizeMb` before submit |
| B1-54 | Download uses authorized route with Bearer token | PASS | `download.js:15-42` — `Authorization: Bearer` on `ENDPOINTS.submissions.download(id)` | None |
| B1-55 | Grading matches docs (`grade`, `feedback`, `status`) | PASS | `GradeFormScreen.js:61-90` — grade required, 0-100 or text max 10, feedback max 2000, status graded/rejected | None |
| B1-56 | Documented endpoints never used by app | PASS | `GET /health` defined but not required by FEATURE_MAP; all other documented feature endpoints are used | None |

**B1 summary:** FAIL items are B1-8 (search not passed to API), B1-13 (search not passed to API), B1-20 (dashboard limit 1 not 5), B1-34 (static permissions), B1-41 (dead endpoint), B1-53 (maxFileSizeMb not enforced).

---

## B2. Feature coverage

| ID | Check | Result | Evidence (file:line) | Fix needed |
|---|---|---|---|---|
| B2-1 | Every FEATURE_MAP screen exists as working screen | PASS | All 25 surfaces have screens (`FEATURE_MAP.md:213-506`) | None |
| B2-2 | Login screen | PASS | `src/screens/auth/LoginScreen.js:1-123` | None |
| B2-3 | Logout (More and Profile) | PASS | `MoreScreen.js:30-42`; `AuthContext.js:37-48` | None |
| B2-4 | Logout-all | PASS | `MoreScreen.js:124-129`; `AuthContext.js:141-150` | None |
| B2-5 | Change password | PASS | `ForceChangePasswordScreen.js`; `ProfileScreen.js:46-68` | None |
| B2-6 | Register (if allowed) | PASS | `UserCreateScreen.js`; gated on `students.create` | None |
| B2-7 | `/me` | PASS | `api/auth.js:15-18`; `AuthContext.js:64` | None |
| B2-8 | Users list | PASS | `UsersScreen.js` | None |
| B2-9 | Batches and enrollment | PASS | `BatchesScreen.js`, `BatchRosterScreen.js` | None |
| B2-10 | Assignments | PASS | `AssignmentsScreen.js`, `AssignmentDetailScreen.js`, `AssignmentFormScreen.js` | None |
| B2-11 | Attendance | PASS | `AttendanceScreen.js`, `AttendanceMarkScreen.js`, `AttendanceEditScreen.js`, `AttendanceSummaryScreen.js` | None |
| B2-12 | Submissions | PASS | `SubmissionsScreen.js`, `SubmissionUploadScreen.js` | None |
| B2-13 | Permissions | FAIL | `PermissionChecklist.js` uses static constants, not `GET /permissions` catalog (`B1-34`) | Fetch catalog from `GET /permissions` |
| B2-14 | Roles | PASS | `RolesScreen.js`, `RoleFormScreen.js` | None |
| B2-15 | Menus/tabs/buttons built from API permissions | PASS | `AppTabs.js:46-78`; `MoreScreen.js:18-26`; `RootNavigator.js` | None |
| B2-16 | Permission names match `config/permissions.js` | PASS | `constants/permissions.js:3-24` mirrors backend (all 21 match) | None |
| B2-17 | Scattered `if role ===` checks | FAIL | `BatchFormScreen.js:28`; `UserCreateScreen.js:27`; `UserEditScreen.js:42`; `BatchesScreen.js:87`; `BatchRosterScreen.js:47`; `AssignmentDetailScreen.js:43`; `SubmissionsScreen.js:35`; `AttendanceScreen.js:37` | Replace with permission checks from `constants/permissions.js` |

**B2 summary:** FAIL items are B2-13 (static permissions), B2-17 (scattered role-equals checks).

---

## B3. Security

| ID | Check | Result | Evidence (file:line) | Fix needed |
|---|---|---|---|---|
| B3-1 | Tokens stored ONLY in expo-secure-store | PASS | `session.js:2` imports `expo-secure-store`; `getItemAsync`/`setItemAsync`/`deleteItemAsync` (lines 9-62). No `AsyncStorage` in `src/` | None |
| B3-2 | No AsyncStorage for tokens | PASS | Grep for `AsyncStorage` returns no matches | None |
| B3-3 | No tokens/passwords/personal data logged | PASS | No `console.log` of tokens/passwords in `src/`; `CredentialsDialog.js` copies but does not log | None |
| B3-4 | No secrets in the app | PASS | `env.js:2` fallback URL is not a secret; no API keys/JWT secrets in bundle | None |
| B3-5 | CORS not loosened in backend | PASS | `app.js:29-38` — `origin: process.env.FRONTEND_URL`, `credentials: true`, limited `allowedHeaders` | None |
| B3-6 | Backend patch only touches allowed areas | PASS | `authController.js:22-36` (`x-client: mobile` body tokens); `cookies.js:44-55` (body refresh fallback). No CORS/cookie/token-lifetime/permission changes | None |
| B3-7 | Web behavior unchanged | PASS | `buildSessionResponse` only adds tokens when `x-client: mobile`; web gets `{ user }` only | None |
| B3-8 | `x-client` header in CORS `allowedHeaders` | NOT TESTED | `app.js:34` omits `x-client`. React Native fetch has no CORS preflight so mobile works. Web would fail preflight if it sends `x-client`. | Add `"x-client"` to `allowedHeaders` if web needs it |

**B3 summary:** No FAIL items. B3-8 is NOT TESTED (mobile unaffected).

---

## B4. Code rules from the original prompt

### B4-1 / B4-2 real scan results

A throwaway script (`scripts/scan-comments.js`, not committed) scanned all 104 JS files under `src/`:

- **Files missing header comment: 0** — every file starts with a `//` comment. **B4-1: PASS.**
- **Functions missing a preceding comment: 203** — every API function, component, screen function, handler, and helper lacks the line-before comment. Full list: `api/assignments.js` (5), `api/attendance.js` (4), `api/auth.js` (6), `api/batches.js` (7), `api/client.js` (8), `api/errors.js` (2), `api/permissions.js` (2), `api/roles.js` (4), `api/submissions.js` (4), `api/users.js` (6), `components/lists/*` (7), `components/states/*` (4), `components/ui/*` (24), `constants/permissions.js` (3), `context/AuthContext.js` (2), `context/ToastContext.js` (2), `hooks/*` (3), `navigation/AppTabs.js` (2), `navigation/RootNavigator.js` (1), screens (~100 functions), `services/*` (8), `utils/*` (~30). **B4-2: FAIL.**

| ID | Check | Result | Evidence (file:line) | Fix needed |
|---|---|---|---|---|
| B4-1 | Every file starts with 2-3 line comment | PASS | Scan: 0 of 104 files missing header | None |
| B4-2 | Every function has a comment | FAIL | Scan: 203 functions missing preceding comment (see list above) | Add `//` comment before every function |
| B4-3 | No file over ~120 lines | FAIL | Offenders: `UserEditScreen` 311, `BatchRosterScreen` 267, `AssignmentDetailScreen` 244, `AssignmentFormScreen` 222, `DashboardScreen` 214, `AttendanceScreen` 204, `AttendanceMarkScreen` 203, `SubmissionUploadScreen` 193, `UserCreateScreen` 192, `AuthContext` 188, `api/client` 184, `RoleFormScreen` 175, `RootNavigator` 171, `SubmissionsScreen` 170, `UsersScreen` 161, `ProfileScreen` 158, `MoreScreen` 153, `AssignmentsScreen` 151, `GradeFormScreen` 150, `BatchesScreen` 127, `GradingScreen` 125, `LoginScreen` 123, `SelectRow` 121 | Split into smaller files/components |
| B4-4 | Every UI piece is reusable component in `src/components` | FAIL | Screens contain raw inline `StyleSheet` and JSX (e.g. `DashboardScreen.js:205-214`, `AssignmentDetailScreen.js:240-244`, `SubmissionUploadScreen.js:186-193`) | Extract to `src/components` |
| B4-5 | Nothing hard-coded | FAIL | `Input.js:84` `fontSize: 16`; `SearchBar.js:47` `fontSize: 16`; `ToggleRow.js:26` `minHeight: 48`; `SelectRow.js:81,114` `minHeight: 48`; `SelectRow.js:112` `maxHeight: 320`; `Badge.js:42` `paddingVertical: 3`; `SegmentedControl.js:37-38` `padding: 3`, `gap: 3`; `ToastContext.js:43` `bottom: 96`; `env.js:2` `http://localhost:5000`; `endpoints.js:2` `const base = '/api'` | Move to theme/constants |
| B4-6 | No duplicated code | FAIL | `RoleFormScreen.js:25` and `RoleCard.js:10` both have `['admin','teacher','student']`; `BatchFormScreen.js:28`, `UserCreateScreen.js:27`, `UserEditScreen.js:42` duplicate `isAdmin` check | Extract to shared utility |
| B4-7 | No TODO | PASS | No `TODO` in `src/` | None |
| B4-8 | No commented-out code | PASS | None found | None |
| B4-9 | No fake/mock data | PASS | All data from API calls | None |
| B4-10 | Every screen handles loading, empty, error-with-Retry, success | PASS | All list screens use `LoadingState`, `EmptyState`, `ErrorState` (with `onRetry`) | None |
| B4-11 | Forms validate on device + show server errors | PASS | Every form has `errors` state, `FormError`, `submitError`; validators in `utils/validators.js` | None |
| B4-12 | Touch targets >= 44px | PASS | `layout.touchTarget = 48` (`theme.js:70`); `Button.js:60`; `MenuRow.js:34` | None |
| B4-13 | Readable fonts, labels on inputs | PASS | `AppText` uses theme `fontSize`; `Input.js:25` renders `label` | None |
| B4-14 | Folder structure matches required structure | PASS | Matches `FEATURE_MAP.md:119-139` | None |
| B4-15 | No axios, Redux, or forbidden libraries | PASS | `package.json` — only Expo + React Navigation | None |
| B4-16 | Dependencies compatible with Expo SDK 58 | PASS | expo `~58.0.22`, react-native `0.88.1`, all `expo-*` `~58.0.x`, `@react-navigation/*` `^7.x` | None |

**B4 summary:** FAIL items are B4-2 (203 functions missing comments), B4-3 (23 files over 120 lines), B4-4 (raw UI in screens), B4-5 (hard-coded values), B4-6 (duplicated code).

---

## B5. Deployment setup

| ID | Check | Result | Evidence (file:line) | Fix needed |
|---|---|---|---|---|
| B5-1 | `app.json` `runtimeVersion {"policy": "appVersion"}` | PASS | `app.json:7-9` | None |
| B5-2 | `app.json` updates URL | PASS | `app.json:40-42` | None |
| B5-3 | `app.json` project ID | PASS | `app.json:35-37` | None |
| B5-4 | `eas.json` staging and production profiles | PASS | `eas.json:12-27` has both profiles | None |
| B5-5 | `eas.json` environment values valid | FAIL | `eas.json:15` `environment: "staging"`. Per current Expo docs (https://docs.expo.dev/eas/environment-variables), default environments are `development`, `preview`, `production`. `"staging"` is not valid (custom names require Enterprise/Production plans). | Change to `environment: "preview"` |
| B5-6 | `eas.json` channels | PASS | `eas.json:14` `channel: "staging"`, `eas.json:23` `channel: "production"` | None |
| B5-7 | Workflow staging → staging, main → production | PASS | `eas-update.yml:37-39`, `:41-43` | None |
| B5-8 | Workflow runs `npm ci` and `npm run lint` before publish | PASS | `eas-update.yml:26-29` | None |
| B5-9 | Workflow uses `EXPO_TOKEN` | PASS | `eas-update.yml:35` | None |
| B5-10 | Workflow `eas update` needs `--environment` | FAIL | `eas-update.yml:39,43` omits `--environment`. Per Expo docs (https://docs.expo.dev/eas-update/getting-started): "specify the `--environment` flag ... (required in SDK 55 and later)". | Add `--environment preview` / `--environment production` |
| B5-11 | Workflow triggers on `main`; repo default branch unknown | NOT TESTED | `eas-update.yml:10` triggers on `main`; default branch not verified | Confirm default branch name |
| B5-12 | `app.json` `updates.url` uncommitted | NOT TESTED | `git status` not run in this audit | Check and commit `app.json` |
| B5-13 | README has install, run, test, 5-step add-screen, Releasing | PASS | `README.md:23-70`, `:80-96`, `:98-185` | None |
| B5-14 | README says EAS wiring not done but `app.json` has it | FAIL | `README.md:140-142` says "NOT YET DONE" but `app.json:40-42` has `updates.url` and `:35-37` has `projectId` | Update README |
| B5-15 | README update commands omit `--environment` | FAIL | `README.md:168-169` `eas update --channel ...` without `--environment` | Fix commands |

**B5 summary:** FAIL items are B5-5 (invalid `environment: "staging"`), B5-10 (missing `--environment`), B5-14 (README outdated), B5-15 (README missing `--environment`).

---

## B6. Run it for real

| ID | Check | Result | Evidence | Fix needed |
|---|---|---|---|---|
| B6-1 | `npm run lint` in mobile-app | FAIL | Real output above: 0 errors, 8 `exhaustive-deps` warnings. Treated as FAIL per project rule. | Fix the 8 warnings |
| B6-2 | `npm run lint` in PORTAL-backend | PASS | Real output above: clean, exit 0 | None |
| B6-3 | `npm test` in PORTAL-backend | PASS | Real output above: 60/60 pass | None |
| B6-4 | `npx expo-doctor` | PASS | Real output above: 20/20 passed | None |
| B6-5 | Start backend + app, test login | NOT TESTED | No live backend/device run | Start backend (`npm start`), create `.env` with LAN IP, `npm start` in mobile-app, scan QR |
| B6-6 | Test refresh, logout | NOT TESTED | — | Against live backend |
| B6-7 | Test one list screen with pagination | NOT TESTED | — | Open Assignments, pull to refresh, tap Load more |
| B6-8 | Test one upload | NOT TESTED | — | Open an assignment as student, upload a ZIP |
| B6-9 | Test one download | NOT TESTED | — | Open a submission, tap Download |

**B6 summary:** FAIL is B6-1 (lint warnings). NOT TESTED are B6-5 through B6-9.

---

## X. Additional issues found during audit

| ID | Issue | Result | Evidence | Fix |
|---|---|---|---|---|
| X-1 | `.env` not in `.gitignore` | FAIL | `.gitignore:34` ignores only `.env*.local` | Add `.env` to `.gitignore` |
| X-2 | Hard-coded fallback API URL | FAIL | `env.js:2` `http://localhost:5000` | Remove fallback or document |
| X-3 | Hard-coded `/api` base in endpoints | FAIL | `endpoints.js:2` `const base = '/api'` | Keep as path constant (acceptable) or derive |
| X-4 | Dashboard sends `status: 'submitted'` (backend ignores) | FAIL | `DashboardScreen.js:40`; backend `submissionService.js:15-50` has no `status` filter | Count ungraded client-side |
| X-5 | Dashboard limits 1/3 instead of `limit=5` | FAIL | `DashboardScreen.js:35-50`; spec `FEATURE_MAP.md:245` | Use `limit=5` |
| X-6 | Assignment detail `createdBy` not populated by backend | FAIL | `AssignmentDetailScreen.js:134` reads `assignment.createdBy?.name`; backend `assignmentService.js:52-54` populates only `batch` | Hide the row in the app (do not change backend) |
| X-7 | 410 closed assignment not detected | FAIL | `AssignmentDetailScreen.js:62-63` generic error | Detect `error.status === 410`, render closed state |
| X-8 | `COMMON.archive` used as closed-assignment label | FAIL | `AssignmentCard.js:14` `COMMON.archive` = "Archive" | Use `COMMON.statusClosed` / "Closed" |
| X-9 | Batch name max 100, backend allows 120 | FAIL | `BatchFormScreen.js:50-51` max 100; backend `constants/index.js:32` `BATCH_NAME_MAX_LENGTH = 120` | Change to 120 |
| X-10 | Batch creation `teacherId` only for admin role | FAIL | `BatchFormScreen.js:28-31,53,61,84`; backend requires `teacherId` for non-teacher | Restrict to admin/teacher or let custom roles select teacher |
| X-11 | Optional batch for student creation admin-only | FAIL | `UserCreateScreen.js:27,31-33,92,135-153`; backend supports `batchId` for any `students.create` | Allow batch selection when `batches.view` |
| X-12 | Role change leaves stale extra permissions | FAIL | `UserEditScreen.js:84-87` clears extras but doesn't submit reconciled set | Send `permissions: []` or reconcile on role save |
| X-13 | Profile missing sign-out everywhere, active status, session note | FAIL | `ProfileScreen.js:94-150` | Add per `FEATURE_MAP.md:493-497` |
| X-14 | More missing app version row | FAIL | `MoreScreen.js:44-150` | Add version row per `FEATURE_MAP.md:503` |
| X-15 | More toasts "Sign out" instead of success | FAIL | `MoreScreen.js:35` `toast(COMMON.signOut)` | Change to success message |
| X-16 | Role form label not required | FAIL | `RoleFormScreen.js:53-62` no `required` on label | Add label validation |
| X-17 | Role form permissions from static constants | FAIL | `RoleFormScreen.js:18-23`; `PermissionChecklist.js:6-10` | Fetch from `GET /permissions` |
| X-18 | Roles search omits permission text | FAIL | `RolesScreen.js:38-42` searches only `name`, `label` | Include permissions in search |
| X-19 | `tests/mobileAuth.test.js` added and passing | PASS | New file; `npm test` 60/60 pass (6 mobile cases) | None |
| X-20 | No native splash config | FAIL | `app.json:1-43` no `splash` key; `package.json` no `expo-splash-screen` | Part 2: configure `expo-splash-screen` |

**X summary:** FAIL items are X-1 through X-18 and X-20 (19 items). X-19 is PASS.

---

## Logo (for Part 2)

`mobile-app/assets/splash-icon.png` exists (17,547 bytes). It is the default Expo splash mark: concentric light-gray circles on a black background, square aspect. It is **not confirmed** as a school logo. Per the original prompt instructions, I am waiting for your confirmation to use this file, or for you to provide a new logo file (PNG, square, at least 1024x1024) before Part 2 begins.

---

## Blockers and questions

1. **Logo provenance:** `assets/splash-icon.png` is the default Expo mark, unconfirmed as a school logo. Confirm use or provide a new PNG (square, ≥1024×1024) before Part 2.
2. **Role-based vs permission-based:** Keeping backend unchanged per your decision. In the app, replace every `role ===` check with permission checks from `src/constants/permissions.js`. If a permission cannot express what the backend enforces, STOP AND ASK with the exact file and line.
3. **No device/live-backend testing yet:** B6-5 through B6-9 are NOT TESTED.

## Proposed fix order (after approval)

1. Part 2: branded two-layer splash (after logo approval).
2. Config blockers: `.env` in `.gitignore`, `eas.json` environment → `preview`, workflow `--environment`, README updates, commit `app.json`.
3. Auth: lint warnings (8), forced-password flow, refresh/retry, idle timeout (mostly PASS already).
4. Correctness: dashboard counts/queues, server search, 410 handling, `maxFileSizeMb` enforcement, batch name max, batch creation for custom roles.
5. Permissions/roles: `GET /permissions` catalog, role form validation, scattered role-equals checks → permission checks.
6. Code rules: add function comments (203), split files >120 lines (23 offenders), extract raw UI, remove hard-coded values.
7. Deployment: fix `eas.json`, workflow, README.
8. Update README/PROGRESS and rerun lint/check/doctor after each area.

---

## Stopping point

The audit report is complete. **No fixes have been made.** Waiting for your approval before starting Part 2 (splash) or Part 3 (fixes).
