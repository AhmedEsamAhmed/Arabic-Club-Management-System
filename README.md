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

## Points System

| Task Type      | Role         | Points |
|----------------|--------------|--------|
| Poster         | Designer     | 10     |
| Video Script   | Scriptwriter | 10     |
| Video Shooting | Photographer | 12     |
| Video Edit     | Supervisor   | 15     |
| Coverage       | Photographer | 10     |

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Firebase config
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password + Email Link)
3. Enable Firestore Database
4. Enable Storage
5. Deploy rules: `firebase deploy --only firestore:rules,storage:rules`
6. Deploy functions: `cd functions && npm install && cd .. && firebase deploy --only functions`

## Environment Variables

See `.env.example` for required variables.