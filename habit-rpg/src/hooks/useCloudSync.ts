import { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { AppData, NutritionState } from '../types';
import {
  subscribeToAuth,
  saveToCloud,
  loadFromCloud,
  exportBackupJSON,
  importBackupJSON,
  isFirebaseConfigured,
} from '../services/firebaseService';

export function useCloudSync(
  appData: AppData,
  replaceAppData: (newData: AppData) => void,
  nutritionData: NutritionState,
  replaceNutritionData: (newNutrition: NutritionState) => void
) {
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error' | 'offline'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() =>
    localStorage.getItem('habit-rpg-last-cloud-sync')
  );
  const [isConfigured, setIsConfigured] = useState<boolean>(isFirebaseConfigured);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const isInitialLoadRef = useRef(true);
  const skipNextRemoteRef = useRef(false);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsub = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setIsConfigured(isFirebaseConfigured());
      if (!currentUser) {
        setSyncStatus('idle');
      }
    });
    return unsub;
  }, []);

  // When user signs in: pull from cloud or push local data
  useEffect(() => {
    if (!user) return;

    let active = true;
    (async () => {
      try {
        setSyncStatus('syncing');
        const cloudData = await loadFromCloud(user.uid);
        if (!active) return;

        if (cloudData && cloudData.gameData) {
          skipNextRemoteRef.current = true;
          replaceAppData(cloudData.gameData);
          if (cloudData.nutritionData) {
            replaceNutritionData(cloudData.nutritionData);
          }
          const nowStr = new Date().toLocaleTimeString();
          setLastSyncTime(nowStr);
          localStorage.setItem('habit-rpg-last-cloud-sync', nowStr);
          setSyncStatus('saved');
        } else {
          // Cloud empty: save current local progress to new cloud account
          await saveToCloud(user.uid, appData, nutritionData);
          const nowStr = new Date().toLocaleTimeString();
          setLastSyncTime(nowStr);
          localStorage.setItem('habit-rpg-last-cloud-sync', nowStr);
          setSyncStatus('saved');
        }
      } catch (err: any) {
        console.error('Failed to initialize cloud sync:', err);
        setCloudError(err.message || 'Cloud sync error');
        setSyncStatus('error');
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  // Debounced auto-save to cloud when user is logged in
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (!user) return;

    if (skipNextRemoteRef.current) {
      skipNextRemoteRef.current = false;
      return;
    }

    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        await saveToCloud(user.uid, appData, nutritionData);
        const nowStr = new Date().toLocaleTimeString();
        setLastSyncTime(nowStr);
        localStorage.setItem('habit-rpg-last-cloud-sync', nowStr);
        setSyncStatus('saved');
        setCloudError(null);
      } catch (err: any) {
        console.error('Auto cloud sync failed:', err);
        setSyncStatus('error');
        setCloudError(err.message || 'Auto cloud sync failed');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [appData, nutritionData, user]);

  const pushToCloud = useCallback(async () => {
    if (!user) throw new Error('Please sign in to save your hero to the cloud.');
    setSyncStatus('syncing');
    try {
      await saveToCloud(user.uid, appData, nutritionData);
      const nowStr = new Date().toLocaleTimeString();
      setLastSyncTime(nowStr);
      localStorage.setItem('habit-rpg-last-cloud-sync', nowStr);
      setSyncStatus('saved');
      setCloudError(null);
    } catch (err: any) {
      setSyncStatus('error');
      setCloudError(err.message || 'Cloud sync failed');
      throw err;
    }
  }, [user, appData, nutritionData]);

  const pullFromCloud = useCallback(async () => {
    if (!user) throw new Error('Please sign in to load your hero from the cloud.');
    setSyncStatus('syncing');
    try {
      const cloudData = await loadFromCloud(user.uid);
      if (cloudData && cloudData.gameData) {
        replaceAppData(cloudData.gameData);
        if (cloudData.nutritionData) {
          replaceNutritionData(cloudData.nutritionData);
        }
        const nowStr = new Date().toLocaleTimeString();
        setLastSyncTime(nowStr);
        localStorage.setItem('habit-rpg-last-cloud-sync', nowStr);
        setSyncStatus('saved');
        setCloudError(null);
      } else {
        throw new Error('No cloud save found for this account.');
      }
    } catch (err: any) {
      setSyncStatus('error');
      setCloudError(err.message || 'Cloud load failed');
      throw err;
    }
  }, [user, replaceAppData, replaceNutritionData]);

  const exportSaveFile = useCallback(() => {
    exportBackupJSON(appData, nutritionData);
  }, [appData, nutritionData]);

  const importSaveFile = useCallback(
    async (file: File) => {
      const imported = await importBackupJSON(file);
      if (imported.gameData) {
        replaceAppData(imported.gameData);
      }
      if (imported.nutritionData) {
        replaceNutritionData(imported.nutritionData);
      }
      if (user && imported.gameData) {
        await saveToCloud(user.uid, imported.gameData, imported.nutritionData);
      }
    },
    [replaceAppData, replaceNutritionData, user]
  );

  return {
    user,
    syncStatus,
    lastSyncTime,
    isConfigured,
    cloudError,
    pushToCloud,
    pullFromCloud,
    exportSaveFile,
    importSaveFile,
    refreshConfigState: () => setIsConfigured(isFirebaseConfigured()),
  };
}
