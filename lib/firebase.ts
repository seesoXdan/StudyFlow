"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

/**
 * Firebase web config. These NEXT_PUBLIC_* values are safe to ship in a static
 * client — Firestore access is guarded by security rules (see firestore.rules).
 * Set them in `.env.local` (see `.env.local.example`) and as GitHub Actions
 * secrets for deployment.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * The shared family workspace id. All of the family's devices read/write under
 * `workspaces/{FAMILY_WORKSPACE_ID}` so the data stays in sync without anyone
 * having to log in. Override with NEXT_PUBLIC_FAMILY_WORKSPACE_ID if desired.
 */
export const FAMILY_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_FAMILY_WORKSPACE_ID || "family";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
    try {
      // Offline-first cache so the installed PWA works without a connection.
      db = initializeFirestore(getFirebaseApp(), {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      db = getFirestore(getFirebaseApp());
    }
  }
  return db;
}

/** Returns true when the required Firebase env vars are present. */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/**
 * Signs the current device in anonymously (invisible to the user — there is no
 * login screen). Family devices all authenticate this way, satisfying the
 * `request.auth != null` security rule while keeping the experience login-free.
 */
export function ensureSignedIn(
  onUser: (user: User | null) => void
): () => void {
  const a = getFirebaseAuth();
  const unsub = onAuthStateChanged(a, (user) => {
    if (user) {
      onUser(user);
    } else {
      signInAnonymously(a).catch((err) => {
        console.error("[StudyFlow] anonymous sign-in failed", err);
        onUser(null);
      });
    }
  });
  return unsub;
}
