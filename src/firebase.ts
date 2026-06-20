/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCX4f09Im79YC83BOaUXlq9v-2a6O1wA34",
  authDomain: "silent-drake-jwh20.firebaseapp.com",
  projectId: "silent-drake-jwh20",
  storageBucket: "silent-drake-jwh20.firebasestorage.app",
  messagingSenderId: "425048386681",
  appId: "1:425048386681:web:be4ca17106be63034d78a8"
};

// Initialize helper
export const getFirebaseApp = () => {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

export const getDb = () => {
  const app = getFirebaseApp();
  return getFirestore(app);
};

export { doc, getDoc, setDoc, updateDoc, collection, onSnapshot };
