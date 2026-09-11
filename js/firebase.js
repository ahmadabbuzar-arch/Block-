/**
 * firebase.js
 * Loads Firebase only if a real config is present. Otherwise the app
 * runs fully in DEMO MODE against localStorage (see firestore.js, auth.js)
 * and in-browser data URLs (see storage.js).
 *
 * To go live:
 * 1. Replace the placeholder values in firebaseConfig below with your
 *    project's real values (Firebase console > Project settings).
 * 2. Add the Firebase SDK <script> tags to index.html (see the comment
 *    at the bottom of index.html) — they are NOT loaded by default so
 *    the app can run offline/in demo mode without any network calls.
 * 3. Reload. BlockTheory detects a real config automatically and
 *    switches every "Demo Mode" badge off.
 */

const firebaseConfig = {
  apiKey: "AIzaSyB3lHX7tUncxX_Zyhn__m0pP3W_dusDm9w",
  authDomain: "minecraft-helper-ff10b.firebaseapp.com",
  projectId: "minecraft-helper-ff10b",
  storageBucket: "minecraft-helper-ff10b.firebasestorage.app",
  messagingSenderId: "667446818358",
  appId: "1:667446818358:web:24b9a7350c4fa3b0084a97",
  measurementId: "G-GX3BE7H2TD"
};

function isFirebaseConfigured() {
  return (
    typeof firebaseConfig.apiKey === "string" &&
    !firebaseConfig.apiKey.startsWith("YOUR_") &&
    firebaseConfig.apiKey.length > 10
  );
}

const BT_DEMO_MODE = !isFirebaseConfigured();

let btFirebaseApp = null;
let btAuth = null;
let btDb = null;
let btStorage = null;

/**
 * Called once, on boot. Only touches the global `firebase` object if the
 * SDK scripts have actually been included in index.html AND a real
 * config has been provided. Never throws if Firebase isn't present.
 */
function initFirebase() {
  if (BT_DEMO_MODE) {
    console.info("[BlockTheory] Running in DEMO MODE — no Firebase config detected.");
    return;
  }
  if (typeof firebase === "undefined") {
    console.warn("[BlockTheory] Firebase config found but SDK scripts are not loaded. Falling back to demo mode.");
    return;
  }
  try {
    btFirebaseApp = firebase.initializeApp(firebaseConfig);
    btAuth = firebase.auth();
    btDb = firebase.firestore();
    btStorage = typeof firebase.storage === "function" ? firebase.storage() : null;
    if (!btStorage) {
      console.warn("[BlockTheory] firebase-storage-compat.js was not loaded — screenshot uploads will stay in demo mode.");
    }
    if (typeof firebase.analytics === "function" && firebaseConfig.measurementId) {
      try { firebase.analytics(); } catch { /* analytics is optional, never blocks the app */ }
    }
  } catch (err) {
    console.error("[BlockTheory] Firebase init failed, falling back to demo mode.", err);
  }
}
