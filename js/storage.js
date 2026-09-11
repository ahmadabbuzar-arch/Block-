/**
 * storage.js
 * uploadScreenshot(file, pathHint) is the ONLY function the UI calls to
 * turn a File into a URL it can store on a test/result. In LIVE mode it
 * uploads to Firebase Storage (bucket set in js/firebase.js) and returns
 * a real download URL. In DEMO MODE it reads the file into a data URL
 * in-browser — nothing leaves the device, and the URL still works
 * everywhere a real screenshotURL would (an <img src="...">, etc).
 *
 * Limits: 5MB max, image files only. Both modes enforce this so a demo
 * screenshot can't blow up localStorage.
 */

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

async function uploadScreenshot(file, pathHint) {
  if (!file) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("Screenshots must be an image file.");
  }
  if (file.size > MAX_SCREENSHOT_BYTES) {
    throw new Error("Screenshot is too large (max 5MB).");
  }

  if (!BT_DEMO_MODE && btStorage) {
    const user = getCurrentUser();
    const uid = user ? user.uid : "anonymous";
    const safeName = `${Date.now()}_${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
    const ref = btStorage.ref().child(`screenshots/${uid}/${pathHint || "test"}/${safeName}`);
    const snapshot = await ref.put(file);
    return snapshot.ref.getDownloadURL();
  }

  // Demo mode fallback: base64 data URL, held only in this browser.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Couldn't read the screenshot."));
    reader.readAsDataURL(file);
  });
}
