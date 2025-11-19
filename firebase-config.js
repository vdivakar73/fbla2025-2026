// Firebase Configuration and Database Helper Functions
const firebaseConfig = {
  apiKey: "AIzaSyAm3kMeAPFxf9n3FAr8ueUZ0EBrQdwmnM0",
  authDomain: "ardrey-kell-lost-found.firebaseapp.com",
  databaseURL: "https://ardrey-kell-lost-found-default-rtdb.firebaseio.com",
  projectId: "ardrey-kell-lost-found",
  storageBucket: "ardrey-kell-lost-found.firebasestorage.app",
  messagingSenderId: "502888379986",
  appId: "1:502888379986:web:67fe11f12bacbcb617118b",
  measurementId: "G-VMBSRB27SN"
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

  async removePickupRequest(pickupId) {
    await db.ref(`pickupRequests/${pickupId}`).remove();
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

  async removeUser(userId) {
    await db.ref(`users/${userId}`).remove();
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
