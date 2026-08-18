"use client";

import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { type FirebaseStorage, getStorage } from "firebase/storage";

import { firebaseClientConfig, isFirebaseClientConfigured } from "./config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

function ensureApp(): FirebaseApp {
  if (!isFirebaseClientConfigured) {
    throw new Error(
      "Firebase no está configurado. Agrega los valores de NEXT_PUBLIC_FIREBASE_* a .env.local y reinicia el servidor."
    );
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseClientConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(ensureApp());
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(ensureApp());
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(ensureApp());
  return storage;
}
