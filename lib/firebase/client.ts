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
  if (!storage) {
    // Storage attaches the signed-in user's token via Firebase's internal
    // "auth-internal" component, but that component is EXPLICIT-instantiation --
    // it's only created once something in this page's JS actually calls
    // getAuth() for this app. Storage never triggers that itself. So on any
    // page that uses getFirebaseStorage() without ever calling
    // getFirebaseAuth() (e.g. photo-uploader.tsx, which only imports the
    // former), every upload silently goes out unauthenticated -- Storage
    // sees request.auth == null and the rules reject it with
    // storage/unauthorized, even though the user is genuinely signed in.
    // Touch auth first so it's always initialized before Storage is used.
    getFirebaseAuth();
    storage = getStorage(ensureApp());
  }
  return storage;
}
