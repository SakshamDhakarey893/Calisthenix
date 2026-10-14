import { useState } from 'react';
import type { User } from 'firebase/auth';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  initFirebase,
} from '../services/firebaseService';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
} from '../services/firebaseConfig';
import type { FirebaseConfig } from '../services/firebaseConfig';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  syncStatus: 'idle' | 'syncing' | 'saved' | 'error' | 'offline';
  lastSyncTime: string | null;
  cloudError: string | null;
  onPushToCloud: () => Promise<void>;
  onPullFromCloud: () => Promise<void>;
  onExportSave: () => void;
  onImportSave: (file: File) => Promise<void>;
  onConfigChanged: () => void;
}

type ModalTab = 'account' | 'file' | 'setup';

export function CloudSyncModal({
  isOpen,
  onClose,
  user,
  syncStatus,
  lastSyncTime,
  cloudError,
  onPushToCloud,
  onPullFromCloud,
  onExportSave,
  onImportSave,
  onConfigChanged,
}: Props) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<ModalTab>(user ? 'account' : 'account');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Config setup state
  const savedConfig = getSavedFirebaseConfig();
  const [configJson, setConfigJson] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalMessage({ text: 'Please fill in both email and password.', type: 'error' });
      return;
    }
    setAuthLoading(true);
    setLocalMessage(null);
    try {
      if (authMode === 'signin') {
        await loginWithEmail(email, password);
        setLocalMessage({ text: 'Signed in successfully! Cloud sync active.', type: 'success' });
      } else {
        await registerWithEmail(email, password);
        setLocalMessage({ text: 'Account created and saved to cloud!', type: 'success' });
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setLocalMessage({ text: err.message || 'Authentication error.', type: 'error' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setLocalMessage(null);
    try {
      await loginWithGoogle();
      setLocalMessage({ text: 'Signed in with Google! Cloud sync active.', type: 'success' });
    } catch (err: any) {
      setLocalMessage({ text: err.message || 'Google sign-in error.', type: 'error' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await logoutUser();
      setLocalMessage({ text: 'Signed out. Now using local guest mode.', type: 'success' });
    } catch (err: any) {
      setLocalMessage({ text: err.message || 'Sign-out error.', type: 'error' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveConfig = () => {
    setLocalMessage(null);
    try {
      let parsed: any;
      if (configJson.trim().startsWith('{')) {
        parsed = JSON.parse(configJson);
      } else {
        // Match standard JS object if user copied `const firebaseConfig = { ... }`
        const jsonMatch = configJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          // Replace JS object keys if unquoted
          const jsonText = jsonMatch[0]
            .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,\s*}/g, '}');
          parsed = JSON.parse(jsonText);
        } else {
          throw new Error('Could not parse configuration object.');
        }
      }

      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error('Config missing apiKey or projectId.');
      }

      const cleanConfig: FirebaseConfig = {
        apiKey: parsed.apiKey,
        authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
        projectId: parsed.projectId,
        storageBucket: parsed.storageBucket || '',
        messagingSenderId: parsed.messagingSenderId || '',
        appId: parsed.appId || '',
      };

      saveFirebaseConfig(cleanConfig);
      initFirebase(cleanConfig);
      onConfigChanged();
      setLocalMessage({ text: 'Firebase connected successfully!', type: 'success' });
      setActiveTab('account');
    } catch (err: any) {
      setLocalMessage({
        text: 'Failed to parse config: ' + (err.message || 'Please check the JSON format.'),
        type: 'error',
      });
    }
  };

  const handleClearConfig = () => {
    if (confirm('Disconnect Firebase configuration?')) {
      clearFirebaseConfig();
      onConfigChanged();
      setLocalMessage({ text: 'Firebase configuration removed.', type: 'success' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAuthLoading(true);
    setLocalMessage(null);
    try {
      await onImportSave(file);
      setLocalMessage({ text: 'Save file imported successfully! Your hero has loaded.', type: 'success' });
    } catch (err: any) {
      setLocalMessage({ text: err.message || 'Failed to import save file.', type: 'error' });
    } finally {
      setAuthLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card cloud-sync-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <span className="sync-title-icon">☁️</span>
            <div>
              <h3>Cross-Device Sync &amp; Backup</h3>
              <p className="modal-subtitle">Save your hero progress across all browsers and devices</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Sync Status Pill */}
        <div className="sync-status-bar">
          <div className="sync-status-indicator">
            <span
              className={`status-dot ${
                user ? 'status-green' : savedConfig ? 'status-yellow' : 'status-gray'
              }`}
            />
            <span className="status-label">
              {user ? (
                <>
                  Logged In: <strong>{user.email || 'Google User'}</strong>
                </>
              ) : savedConfig ? (
                'Firebase Ready (Not Signed In)'
              ) : (
                'Local Offline Mode'
              )}
            </span>
          </div>
          {lastSyncTime && (
            <span className="last-sync-tag">Last Synced: {lastSyncTime}</span>
          )}
        </div>

        {/* Feedback message */}
        {(localMessage || cloudError) && (
          <div className={`sync-alert-banner ${localMessage?.type || 'error'}`}>
            <span>{localMessage?.text || cloudError}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="sync-modal-tabs">
          <button
            className={`sync-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            👤 Cloud Account
          </button>
          <button
            className={`sync-tab-btn ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            💾 File Backup / Restore
          </button>
          <button
            className={`sync-tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => setActiveTab('setup')}
          >
            ⚙️ Cloud Setup {savedConfig ? '✓' : ''}
          </button>
        </div>

        {/* Tab 1: Cloud Account */}
        {activeTab === 'account' && (
          <div className="sync-tab-content">
            {user ? (
              <div className="user-logged-box">
                <div className="user-profile-header">
                  <div className="user-avatar-circle">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="user-avatar-img" />
                    ) : (
                      <span>🛡️</span>
                    )}
                  </div>
                  <div className="user-details">
                    <div className="user-email-text">{user.email || 'Hero Adventurer'}</div>
                    <div className="user-sync-hint">
                      Auto-sync enabled. Any level up, quest, or diet log is backed up to the cloud.
                    </div>
                  </div>
                </div>

                <div className="sync-actions-row">
                  <button
                    className="btn-sync-action btn-upload"
                    onClick={onPushToCloud}
                    disabled={syncStatus === 'syncing'}
                  >
                    {syncStatus === 'syncing' ? '⏳ Syncing...' : '⚡ Upload to Cloud Now'}
                  </button>
                  <button
                    className="btn-sync-action btn-download"
                    onClick={onPullFromCloud}
                    disabled={syncStatus === 'syncing'}
                  >
                    📥 Pull From Cloud
                  </button>
                </div>

                <div className="signout-section">
                  <button
                    className="btn-sync-signout"
                    onClick={handleLogout}
                    disabled={authLoading}
                  >
                    Sign Out (Switch to Local Mode)
                  </button>
                </div>
              </div>
            ) : savedConfig ? (
              <div className="auth-form-container">
                <div className="auth-mode-switch">
                  <button
                    className={authMode === 'signin' ? 'active' : ''}
                    onClick={() => setAuthMode('signin')}
                  >
                    Sign In
                  </button>
                  <button
                    className={authMode === 'signup' ? 'active' : ''}
                    onClick={() => setAuthMode('signup')}
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleEmailAuth} className="auth-form">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="adventurer@realm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-auth-submit"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? 'Please wait...'
                      : authMode === 'signin'
                      ? 'Sign In & Sync'
                      : 'Create Account & Sync'}
                  </button>
                </form>

                <div className="auth-divider">
                  <span>OR</span>
                </div>

                <button
                  type="button"
                  className="btn-google-auth"
                  onClick={handleGoogleAuth}
                  disabled={authLoading}
                >
                  <span className="google-icon">G</span> Sign in with Google
                </button>
              </div>
            ) : (
              <div className="no-config-box">
                <div className="no-config-icon">☁️</div>
                <h4>Automatic Cloud Sync Needs Setup</h4>
                <p>
                  To sync seamlessly across devices without downloading files, connect your free
                  Firebase backend (takes 2 minutes, 100% free).
                </p>
                <div className="no-config-actions">
                  <button
                    className="btn-primary-glow"
                    onClick={() => setActiveTab('setup')}
                  >
                    ⚙️ Connect Firebase Now
                  </button>
                  <button
                    className="btn-secondary-clean"
                    onClick={() => setActiveTab('file')}
                  >
                    💾 Use Save File Instead (Instant)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Instant File Backup / Restore */}
        {activeTab === 'file' && (
          <div className="sync-tab-content">
            <div className="file-backup-intro">
              <h4>Instant Save File Transfer</h4>
              <p>
                Transfer your hero, completed quests, habits, water logs, and custom meals to another
                browser or computer immediately with zero registration required.
              </p>
            </div>

            <div className="file-cards-grid">
              {/* Export Card */}
              <div className="file-card export-card">
                <div className="file-card-header">
                  <span className="file-card-icon">⬇️</span>
                  <div>
                    <h5>Export Save File</h5>
                    <p>Download a .json backup of your current character and quests</p>
                  </div>
                </div>
                <button className="btn-export-download" onClick={onExportSave}>
                  Download Save (.json)
                </button>
              </div>

              {/* Import Card */}
              <div className="file-card import-card">
                <div className="file-card-header">
                  <span className="file-card-icon">⬆️</span>
                  <div>
                    <h5>Import Save File</h5>
                    <p>Restore your hero from a previously downloaded .json file</p>
                  </div>
                </div>
                <label className="btn-import-upload">
                  Choose Save File (.json)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Firebase Setup Guide */}
        {activeTab === 'setup' && (
          <div className="sync-tab-content setup-guide">
            <div className="setup-intro">
              <h4>Connect Your Free Cloud Backend (Firebase)</h4>
              <p>
                Follow these 3 simple steps to get your free credentials from the Google Firebase
                Console:
              </p>
            </div>

            <ol className="setup-steps-list">
              <li>
                Visit{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="setup-link"
                >
                  Firebase Console ↗
                </a>{' '}
                and click <strong>Add project</strong> (Free Spark plan).
              </li>
              <li>
                In the project overview, click the <strong>Web &lt;/&gt;</strong> icon to register an app.
                Copy the <code>firebaseConfig</code> object.
              </li>
              <li>
                Enable <strong>Authentication</strong> (Email/Password &amp; Google) and create a{' '}
                <strong>Cloud Firestore database</strong>.
              </li>
            </ol>

            <div className="form-group">
              <label>Paste your Firebase Config (JSON or JavaScript snippet):</label>
              <textarea
                className="config-textarea"
                rows={5}
                placeholder={`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};`}
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
              />
            </div>

            <div className="setup-button-bar">
              <button className="btn-save-config" onClick={handleSaveConfig}>
                💾 Save &amp; Connect Firebase
              </button>
              {savedConfig && (
                <button className="btn-clear-config" onClick={handleClearConfig}>
                  Disconnect Config
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
