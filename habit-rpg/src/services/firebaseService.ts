import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User, Auth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getSavedFirebaseConfig } from './firebaseConfig';
import type { FirebaseConfig } from './firebaseConfig';
import type { AppData, NutritionState } from '../types';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export function initFirebase(customConfig?: FirebaseConfig): boolean {
  const config = customConfig || getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return false;
  }

  try {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(config);
    }
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    return true;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return false;
  }
}

// Initial attempt to connect if config exists
initFirebase();

export function isFirebaseConfigured(): boolean {
  return !!authInstance && !!dbInstance;
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!authInstance) {
    initFirebase();
  }
  if (!authInstance) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(authInstance, callback);
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  if (!authInstance) {
    const initialized = initFirebase();
    if (!initialized || !authInstance) {
      throw new Error('Firebase is not configured yet. Please configure your Firebase keys first.');
    }
  }
  const cred = await signInWithEmailAndPassword(authInstance, email, pass);
  return cred.user;
}

export async function registerWithEmail(email: string, pass: string): Promise<User> {
  if (!authInstance) {
    const initialized = initFirebase();
    if (!initialized || !authInstance) {
      throw new Error('Firebase is not configured yet. Please configure your Firebase keys first.');
    }
  }
  const cred = await createUserWithEmailAndPassword(authInstance, email, pass);
  return cred.user;
}

export async function loginWithGoogle(): Promise<User> {
  if (!authInstance) {
    const initialized = initFirebase();
    if (!initialized || !authInstance) {
      throw new Error('Firebase is not configured yet. Please configure your Firebase keys first.');
    }
  }
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(authInstance, provider);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  if (authInstance) {
    await signOut(authInstance);
  }
}

export interface CloudSavePayload {
  gameData: AppData;
  nutritionData: NutritionState;
  updatedAt: string;
}

export async function saveToCloud(
  userId: string,
  gameData: AppData,
  nutritionData: NutritionState
): Promise<void> {
  if (!dbInstance) {
    const ok = initFirebase();
    if (!ok || !dbInstance) {
      throw new Error('Cloud database is not initialized');
    }
  }

  const userDocRef = doc(dbInstance, 'users', userId);
  const payload: CloudSavePayload = {
    gameData,
    nutritionData,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(userDocRef, payload, { merge: true });
}

export async function loadFromCloud(userId: string): Promise<CloudSavePayload | null> {
  if (!dbInstance) {
    const ok = initFirebase();
    if (!ok || !dbInstance) return null;
  }

  const userDocRef = doc(dbInstance, 'users', userId);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    return snap.data() as CloudSavePayload;
  }
  return null;
}

export function subscribeToCloudSave(
  userId: string,
  onRemoteUpdate: (payload: CloudSavePayload) => void
): () => void {
  if (!dbInstance) {
    const ok = initFirebase();
    if (!ok || !dbInstance) return () => {};
  }

  const userDocRef = doc(dbInstance, 'users', userId);
  return onSnapshot(userDocRef, (snap) => {
    if (snap.exists()) {
      onRemoteUpdate(snap.data() as CloudSavePayload);
    }
  });
}

/**
 * Export current local or active state as a downloadable JSON file.
 * Compatible across all browsers and machines with zero backend requirement.
 */
export function exportBackupJSON(gameData: AppData, nutritionData: NutritionState): void {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    gameData,
    nutritionData,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `calisthenix-save-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate an uploaded JSON save file.
 */
export async function importBackupJSON(
  file: File
): Promise<{ gameData: AppData; nutritionData: NutritionState }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.gameData && !parsed.quests && !parsed.player) {
          throw new Error('Invalid save file format. Expected Calisthenix save file.');
        }

        const gameData: AppData = parsed.gameData || {
          quests: parsed.quests || [],
          player: parsed.player || { totalXP: 0, level: 1, title: 'Novice', lastActiveDate: '' },
          settings: parsed.settings || { autoDailyQuests: true, dailyQuestCount: 2 },
          lastDailyDate: parsed.lastDailyDate || '',
        };

        const nutritionData: NutritionState = parsed.nutritionData || null;

        resolve({ gameData, nutritionData });
      } catch (err: any) {
        reject(new Error(err.message || 'Failed to read save file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk'));
    reader.readAsText(file);
  });
}
