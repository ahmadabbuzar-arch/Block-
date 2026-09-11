/**
 * auth.js
 * Single abstraction the UI calls regardless of demo/live mode:
 *   signIn(), signOutUser(), getCurrentUser(), onAuthChange(cb)
 */

const DEMO_USER_KEY = "bt_demo_user";

let btCurrentUser = null;
const btAuthListeners = [];

function onAuthChange(cb) {
  btAuthListeners.push(cb);
  cb(btCurrentUser);
}

function notifyAuthListeners() {
  btAuthListeners.forEach((cb) => cb(btCurrentUser));
}

async function signIn() {
  if (!BT_DEMO_MODE && btAuth) {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await btAuth.signInWithPopup(provider);
    btCurrentUser = {
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL
    };
    notifyAuthListeners();
    return btCurrentUser;
  }

  // Demo mode: create a believable local creator profile instantly.
  btCurrentUser = {
    uid: "demo-user",
    displayName: "Creator (Demo)",
    email: "demo@blocktheory.app",
    photoURL: null,
    demo: true
  };
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(btCurrentUser));
  notifyAuthListeners();
  return btCurrentUser;
}

async function signOutUser() {
  if (!BT_DEMO_MODE && btAuth) {
    await btAuth.signOut();
  }
  btCurrentUser = null;
  localStorage.removeItem(DEMO_USER_KEY);
  notifyAuthListeners();
}

function getCurrentUser() {
  return btCurrentUser;
}

function restoreSession() {
  if (!BT_DEMO_MODE && btAuth) {
    btAuth.onAuthStateChanged((user) => {
      btCurrentUser = user
        ? { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }
        : null;
      notifyAuthListeners();
    });
    return;
  }
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (stored) {
    btCurrentUser = JSON.parse(stored);
  }
  notifyAuthListeners();
}
