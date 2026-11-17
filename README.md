# School Portal

The mobile app for the School Portal. Students, teachers, and administrators
can access the features available to their account, including assignments,
submissions, attendance, batches, and user management.

Built with React Native and Expo. The app connects to the School Portal API.

## AI draft feedback

When an AI draft is available, its marks and feedback are only a suggestion. You
decide the final grade, and no grade or feedback is stored until you save it
yourself.

## Run locally

You'll need Node.js 20 or newer, npm, and Expo Go on an Android phone.

```powershell
npm install
Copy-Item .env.example .env
```

Set `EXPO_PUBLIC_API_URL` in `.env` to your backend's base URL (without `/api`).
For a local backend, use your computer’s network address so your phone can
reach it.

Start Expo:

```powershell
npm start
```

Scan the QR code with Expo Go. If you change `.env`, restart with
`npx expo start -c`.

## Useful commands

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run android` | Start the app on Android |
| `npm run lint` | Check code style |
| `npm run check` | Check source files for syntax errors |
| `npm run doctor` | Run Expo health checks |

## Builds and updates

Android builds and over-the-air updates use EAS. Build profiles are in
`eas.json`; updates are published automatically from the `staging` and
`master` branches. Native changes, such as adding a native package, require a
new build.
