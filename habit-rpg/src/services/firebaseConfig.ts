export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

export const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyDm5yaH_WRPMB7rurt0Fe5bSt5yDS-v0UQ",
  authDomain: "habit-rpg-bac7e.firebaseapp.com",
  projectId: "habit-rpg-bac7e",
  storageBucket: "habit-rpg-bac7e.firebasestorage.app",
  messagingSenderId: "948036767640",
  appId: "1:948036767640:web:25a92aeefbc7e3471825ed",
  measurementId: "G-VVN3NH28Z2",
};

export const FIREBASE_CONFIG_KEY = 'habit-rpg-firebase-config-v1';

export function getSavedFirebaseConfig(): FirebaseConfig {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FirebaseConfig;
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read saved Firebase config:', err);
  }

  // Check if env variables were provided
  const envKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
  if (envKey && envProjectId) {
    return {
      apiKey: envKey,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
      measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || '',
    };
  }

  return defaultFirebaseConfig;
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
}
