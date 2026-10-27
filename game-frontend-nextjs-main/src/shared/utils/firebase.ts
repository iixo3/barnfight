import { initializeApp } from "@firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "@firebase/functions";

const firebaseConfig = (() => {
  try {
    return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CLIENT_CONFIG || "");
  } catch (err) {
    console.error("Error firebase config", err);
  }
})();

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
// connectFunctionsEmulator(functions, "127.0.0.1", 5001);
