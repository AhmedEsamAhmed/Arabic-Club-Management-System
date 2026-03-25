# Arabic Club Management System

A full-featured React + Firebase web application for managing the Arabic Club's Media and Department operations.

## Tech Stack

- **Frontend**: Vite + React (JSX), Tailwind CSS, Framer Motion, Lucide React, react-hot-toast
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Routing**: React Router v6

## Features

- 🔐 **Multi-role Auth**: Leader (email/password), Media (email/password + approval flow), Department (email link / passwordless)
- 📅 **Events Management**: Create events, set requirements (Poster, Video, Coverage), attach files
- ⚡ **Task Generation**: Auto-generate tasks from event requirements with assigned roles and points
- 📋 **Operations Dashboard**: Full task management with status/role filters; leader CRUD, media status updates
- ✅ **My Tasks**: Media members update task status, progress (%), and notes
- 🔔 **Notifications**: In-app notification system with read/unread state
- 🕐 **Availability**: Media members set weekly availability slots
- 🏆 **Leaderboard**: Lifetime points ranking
- 📆 **Weekly Leaderboard**: Points earned this week (Malaysia Time)
- ☁️ **Cloud Functions**: Auto-award points when tasks complete (with duplicate prevention)

---

## How to Run the System (Step-by-Step)

### Prerequisites

Make sure the following tools are installed on your machine:

| Tool | Min version | Download |
|------|-------------|----------|
| Node.js | 18 or higher | https://nodejs.org |
| npm | comes with Node | — |
| Firebase CLI | latest | `npm install -g firebase-tools` |
| Git | any | https://git-scm.com |

Verify your setup:
```bash
node -v        # should print v18.x or higher
npm -v
firebase --version
```

---

### Step 1 — Create a Firebase project

1. Open [console.firebase.google.com](https://console.firebase.google.com) and sign in with your Google account.
2. Click **"Add project"**.
3. Enter a project name, e.g. `arabic-club-system`, and click **Continue**.
4. You can disable Google Analytics if you don't need it, then click **Create project**.
5. Wait for the project to be ready, then click **Continue**.

---

### Step 2 — Register a Web App and get the config

1. In the Firebase console, click the **`</>`** (Web) icon on the project overview page.
2. Enter an app nickname, e.g. `Arabic Club Web`, then click **Register app**.
3. Firebase will show you a **firebaseConfig** object that looks like this:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "arabic-club-system.firebaseapp.com",
     projectId: "arabic-club-system",
     storageBucket: "arabic-club-system.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

4. **Keep this page open** — you will copy these values in Step 4.

---

### Step 3 — Enable Firebase services

#### 3a. Authentication
1. In the left sidebar click **Build → Authentication**, then **Get started**.
2. Under the **Sign-in method** tab, enable:
   - **Email/Password** → toggle on, click Save.
   - **Email link (passwordless sign-in)** → toggle on inside the Email/Password row, click Save.

#### 3b. Firestore Database
1. Click **Build → Firestore Database**, then **Create database**.
2. Choose **Start in production mode** (rules will be deployed from this repo).
3. Select a region close to you (e.g. `asia-southeast1` for Malaysia), then **Enable**.

#### 3c. Storage
1. Click **Build → Storage**, then **Get started**.
2. Click **Next** (accept the default security rules for now — you'll replace them).
3. Choose the same region as Firestore, then **Done**.

---

### Step 4 — Configure environment variables

1. In the project root, copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` in any text editor and fill in the values from the firebaseConfig you got in Step 2:

   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=arabic-club-system.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=arabic-club-system
   VITE_FIREBASE_STORAGE_BUCKET=arabic-club-system.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

   > ⚠️ Never commit your `.env` file — it is already listed in `.gitignore`.

---

### Step 5 — Install dependencies

```bash
# From the project root
npm install
```

This installs all frontend dependencies (React, Firebase SDK, Tailwind, Framer Motion, etc.).

---

### Step 6 — Run the development server

```bash
npm run dev
```

You should see output like:

```
  VITE v5.x.x  ready in 300 ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. You will see the Arabic Club home screen with three role cards.

---

### Step 7 — First login as Leader

> The leader account is created automatically on the **first** sign-in. There is no separate registration page for the leader.

1. First, create the leader's Firebase Auth account:
   - In the Firebase console, go to **Authentication → Users → Add user**.
   - Enter the leader's email (e.g. `ahmed@arabicclub.com`) and a strong password.
   - Click **Add user**.

2. Back in the app, click **"Leader"** on the home screen.
3. Sign in with the email and password you just created.
4. The app will automatically create the Firestore profile with `userType: "leader"`.
5. You are now logged in as leader and will be redirected to the Events page.

---

### Step 8 — Deploy Firestore and Storage security rules

From the project root, connect the Firebase CLI to your project:

```bash
firebase login          # opens browser to authenticate
firebase use --add      # select your project and give it an alias (e.g. "default")
```

Then deploy the rules:

```bash
firebase deploy --only firestore:rules,storage:rules
```

> ⚠️ The app **will not work properly without this step** — Firestore will reject reads/writes until the rules are deployed.

---

### Step 9 — Deploy Cloud Functions (points system)

The Cloud Function (`onTaskComplete`) auto-awards points when a task is marked as **Completed**.

```bash
# Install function dependencies
cd functions
npm install
cd ..

# Deploy
firebase deploy --only functions
```

> 📝 Cloud Functions require a **Blaze (pay-as-you-go)** billing plan on Firebase. Upgrade in the Firebase console under **Spark → Upgrade**. Usage within the free tier limits is typically free.

---

### Step 10 — Invite media members

Once you are logged in as leader:

1. Share the app URL with media team members.
2. They click **"Media Member"** on the home screen and sign up with their email, password, and team role (Designer / Photographer / Scriptwriter / Supervisor).
3. Their account starts as **pending** (`approved: false`).
4. Go to **Leader Tools → Members** in the sidebar and click **Approve** next to each member.

---

### Step 11 — Invite department members (passwordless)

Department members use a **magic link** (no password required):

1. Department member clicks **"Department"** on the home screen.
2. They enter their email and click **Send Sign-in Link**.
3. They receive an email with a sign-in link — clicking it opens the app and signs them in automatically.

> ⚠️ For email links to work, the **"Authorized domains"** list in Firebase Auth must include your app's domain. For local development, `localhost` is already authorized by default.

---

### All npm scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start local dev server (hot reload) |
| Build | `npm run build` | Compile production bundle to `dist/` |
| Preview | `npm run preview` | Preview the production build locally |
| Lint | `npm run lint` | Run ESLint |

---

### Production deployment (Firebase Hosting)

To deploy the frontend to Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at `https://<your-project-id>.web.app`.

To deploy everything at once:

```bash
npm run build
firebase deploy
```

---

## Project Structure

```
/
├── src/
│   ├── main.jsx              # App entry point
│   ├── App.jsx               # Router + Toaster setup
│   ├── index.css             # Global styles
│   ├── lib/
│   │   ├── firebase.js       # Firebase SDK initialisation
│   │   └── weekKeyMYT.js     # Malaysia-time ISO week helper
│   ├── context/
│   │   └── AuthContext.jsx   # Auth state + user profile
│   ├── components/
│   │   ├── Layout.jsx        # Page wrapper (sidebar + content)
│   │   ├── Sidebar.jsx       # Left sidebar navigation
│   │   ├── ProtectedRoute.jsx
│   │   └── ui/               # Reusable components
│   └── pages/                # One file per page/route
├── functions/
│   ├── index.js              # onTaskComplete Cloud Function
│   └── weekKey.js            # MYT week key helper (server-side)
├── firebase/
│   ├── firestore.rules       # Firestore security rules
│   └── storage.rules         # Storage security rules
├── .env.example              # Environment variable template
└── firebase.json             # Firebase project config
```

---

## Points System

| Task Type      | Role         | Points |
|----------------|--------------|--------|
| Poster         | Designer     | 10     |
| Video Script   | Scriptwriter | 10     |
| Video Shooting | Photographer | 12     |
| Video Edit     | Supervisor   | 15     |
| Coverage       | Photographer | 10     |

Points are awarded automatically by a Cloud Function when a task's status is set to **Completed**. Duplicate awards are prevented by the `pointsAwarded` flag on each task document.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `VITE_FIREBASE_*` variables are `undefined` | Make sure `.env` is in the project root and the key names match exactly (include the `VITE_` prefix) |
| "Missing or insufficient permissions" in the console | Deploy Firestore rules: `firebase deploy --only firestore:rules` |
| Email link sign-in doesn't arrive | Check spam folder; make sure Email/Password + Email link are both enabled in Firebase Auth |
| Cloud Function not awarding points | Make sure you are on the Blaze plan and deployed functions: `firebase deploy --only functions` |
| Port 5173 already in use | Run `npm run dev -- --port 3000` to use a different port |