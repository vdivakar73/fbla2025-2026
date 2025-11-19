// Firebase Configuration and Database Helper Functions
// Replace with your actual Firebase config from: https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Database Helper Functions
const DB = {
  // Lost Items
  async getLostItems() {
    const snapshot = await db.ref('lostItems').once('value');
    return snapshot.val() ? Object.values(snapshot.val()) : [];
  },

  async addLostItem(item) {
    const newRef = db.ref('lostItems').push();
    item.id = newRef.key;
    await newRef.set(item);
    return item;
  },

  async removeLostItem(itemId) {
    await db.ref(`lostItems/${itemId}`).remove();
  },

  // Pickup Requests
  async getPickupRequests() {
    const snapshot = await db.ref('pickupRequests').once('value');
    return snapshot.val() ? Object.values(snapshot.val()) : [];
  },

  async addPickupRequest(request) {
    const newRef = db.ref('pickupRequests').push();
    request.id = newRef.key;
    await newRef.set(request);
    return request;
  },

  // Users (for authentication)
  async getUsers() {
    const snapshot = await db.ref('users').once('value');
    return snapshot.val() ? Object.values(snapshot.val()) : [];
  },

  async addUser(user) {
    const newRef = db.ref('users').push();
    user.id = newRef.key;
    await newRef.set(user);
    return user;
  },

  async getUserByEmail(email) {
    const snapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    const users = snapshot.val();
    return users ? Object.values(users)[0] : null;
  },

  // Feedback
  async addFeedback(feedback) {
    const newRef = db.ref('feedback').push();
    feedback.id = newRef.key;
    feedback.timestamp = firebase.database.ServerValue.TIMESTAMP;
    await newRef.set(feedback);
    return feedback;
  },

  // Real-time listeners
  onLostItemsChange(callback) {
    db.ref('lostItems').on('value', (snapshot) => {
      const items = snapshot.val() ? Object.values(snapshot.val()) : [];
      callback(items);
    });
  },

  onPickupRequestsChange(callback) {
    db.ref('pickupRequests').on('value', (snapshot) => {
      const requests = snapshot.val() ? Object.values(snapshot.val()) : [];
      callback(requests);
    });
  }
};

// Migration Helper - Run once to migrate localStorage to Firebase
async function migrateLocalStorageToFirebase() {
  try {
    // Migrate lost items
    const lostItems = JSON.parse(localStorage.getItem('lostItems') || '[]');
    for (const item of lostItems) {
      await DB.addLostItem(item);
    }

    // Migrate pickup requests
    const pickups = JSON.parse(localStorage.getItem('pickupRequests') || '[]');
    for (const pickup of pickups) {
      await DB.addPickupRequest(pickup);
    }

    // Migrate users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    for (const user of users) {
      await DB.addUser(user);
    }

    console.log('Migration completed successfully');
    alert('Data migrated to cloud database successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    alert('Migration failed: ' + error.message);
  }
}
