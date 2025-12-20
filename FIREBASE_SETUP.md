# Firebase Database Setup Guide

## Why Firebase?
Your website currently uses localStorage, which stores data only in each user's browser. Firebase Realtime Database will make all data (lost items, users, pickup requests) synchronized across all users worldwide in real-time.

## Setup Steps (15 minutes)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it: `ardrey-kell-lost-found`
4. Disable Google Analytics (not needed)
5. Click "Create project"

### Step 2: Enable Realtime Database
1. In your Firebase project, click "Realtime Database" in the left menu
2. Click "Create Database"
3. Choose location: "United States (us-central1)"
4. Start in **TEST MODE** (we'll secure it later)
5. Click "Enable"

### Step 3: Get Firebase Configuration
1. Click the gear icon (⚙️) → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app name: `AKHS Lost & Found`
5. Copy the `firebaseConfig` object

### Step 4: Update firebase-config.js
Replace the placeholder config in `firebase-config.js` with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "ardrey-kell-lost-found.firebaseapp.com",
  databaseURL: "https://ardrey-kell-lost-found-default-rtdb.firebaseio.com",
  projectId: "ardrey-kell-lost-found",
  storageBucket: "ardrey-kell-lost-found.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 5: Add Firebase Scripts to HTML
Add these script tags to ALL your HTML files (before the closing `</body>` tag):

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script src="firebase-config.js"></script>
```

### Step 6: Update Database Rules (Security)
In Firebase Console → Realtime Database → Rules, replace with:

```json
{
  "rules": {
    "lostItems": {
      ".read": true,
      ".write": true
    },
    "pickupRequests": {
      ".read": true,
      ".write": true
    },
    "users": {
      ".read": true,
      ".write": true,
      ".indexOn": ["email"]
    },
    "feedback": {
      ".read": "auth != null",
      ".write": true
    }
  }
}
```

### Step 7: Migrate Existing Data (One-time)
After Firebase is configured, open browser console on your website and run:
```javascript
migrateLocalStorageToFirebase();
```

## Files to Update

I've created `firebase-config.js` with all the database helper functions. You need to:

1. **Update firebase-config.js** with your actual Firebase credentials
2. **Add Firebase scripts** to these files:
   - index.html
   - login.html
   - find-your-missing-item.html
   - file-a-complaint.html
   - coordinate-pickup.html
   - feedback.html

3. **Replace localStorage calls** with Firebase calls:
   - `localStorage.getItem('lostItems')` → `await DB.getLostItems()`
   - `localStorage.setItem('lostItems', ...)` → `await DB.addLostItem(...)`
   - etc.

## Benefits
- ✅ Data synced across all users worldwide
- ✅ Real-time updates (no page refresh needed)
- ✅ Data persists even if browser cache is cleared
- ✅ Free tier supports 100k simultaneous connections
- ✅ Automatic backups by Firebase

## Need Help?
After you complete Steps 1-4 above, let me know and I'll update all the HTML files to use Firebase automatically!
