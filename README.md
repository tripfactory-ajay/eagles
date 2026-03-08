# 🦅 Eagles – Family Memory App

Private family travel memory app for the Kumar family.

## Quick Start

1. Open `public/index.html` in a browser, or deploy to Firebase Hosting
2. Click **Demo Login – Dad Raj Kumar** to enter
3. The app will auto-seed 10 family memories into Firestore on first run

---

## Firebase Setup (orn-wiki project)

### 1. Enable Authentication
- Firebase Console → Authentication → Sign-in method
- Enable **Email/Password**
- Create the demo user: `demo@eagles.app` / `demo123`

### 2. Create Firestore Database
- Firebase Console → Firestore Database → Create database
- Choose **production mode** (or test mode to start)
- Region: `europe-west1` (matches your project)

### 3. Firestore Security Rules
Paste these rules in Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /eagles_memories/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Firebase Storage Rules
Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /eagles_photos/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Deploy to Firebase Hosting (optional)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # set public dir to: public
firebase deploy
```

---

## Project Structure

```
/eagles-app
  /public
    index.html          ← Main app (open this)
    style.css           ← All styles
    app.js              ← App logic + Firebase
    manifest.json       ← PWA manifest
    service-worker.js   ← Offline support
  /assets
    /icons              ← App icons
  /firebase
    firebase-config.js  ← Firebase credentials + feature flags
  README.md
```

---

## Features

- 🏠 **Family Wall** – Instagram-style feed with likes & comments
- 📷 **Add Memory** – Photo upload, location, activity, emotion
- 📅 **Calendar** – Browse memories by date
- ⚡ **Activities** – Filter by Golf, Padel, Beach, Travel, etc.
- 👤 **Profile** – Stats and family roster
- 📲 **PWA** – Install on iPhone/Android, works offline

## Optional Modules (firebase-config.js)

```js
const FEATURES = {
  timeline: true,   // AI travel timeline
  mapView: false,   // World map pins
  chat: false,      // Family chat
  albums: false,    // Trip albums
  videoUpload: false,
  reactions: false
};
```

Set any to `true` to enable when built.

---

## Demo Credentials

| Email | Password |
|-------|----------|
| demo@eagles.app | demo123 |

---

## Family Members

| Name | Role | UID |
|------|------|-----|
| Raj Kumar | Dad | demo-raj-001 |
| Fiona Kumar | Mum | demo-fiona-002 |
| Natasha Kumar | Daughter | demo-natasha-003 |
| Tanya Kumar | Daughter | demo-tanya-004 |
