import { xpProgress } from '../types';
import type { PlayerStats } from '../types';
import type { User } from 'firebase/auth';

interface Props {
  player: PlayerStats;
  justLeveled: boolean;
  user?: User | null;
  syncStatus?: 'idle' | 'syncing' | 'saved' | 'error' | 'offline';
  onOpenSyncModal?: () => void;
}

export function Header({ player, justLeveled, user, syncStatus, onOpenSyncModal }: Props) {
  const progress = xpProgress(player.totalXP);

  return (
    <header className="header">
      <div className="header-brand">
        <span className="brand-logo-icon">⚡</span>
        <div className="brand-title-group">
          <span className="brand-name">CALISTHENIX</span>
          <span className="brand-tagline">DISCIPLINE RPG</span>
        </div>
      </div>

      <div className="header-left">
        <div className="avatar">
          <span className="avatar-icon">⚔️</span>
          <span className="level-badge">{player.level}</span>
        </div>
        <div className="player-info">
          <h1 className="player-title">
            {player.title}
            {justLeveled && <span className="level-up-flash"> LEVEL UP!</span>}
          </h1>
          <p className="player-sub">Level {player.level} · {player.totalXP.toLocaleString()} Total XP</p>
        </div>
      </div>

      <div className="header-right">
        <div className="xp-section">
          <div className="xp-labels">
            <span>XP</span>
            <span>
              {progress.current} / {progress.needed}
            </span>
          </div>
          <div className="xp-bar-track">
            <div
              className="xp-bar-fill"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {onOpenSyncModal && (
          <button
            className={`btn-header-sync ${user ? 'synced' : 'local'}`}
            onClick={onOpenSyncModal}
            title={user ? `Cloud Synced as ${user.email}` : 'Cloud Sync & Backup'}
            type="button"
          >
            <span className="sync-icon">
              {syncStatus === 'syncing' ? '🔄' : user ? '🟢' : '☁️'}
            </span>
            <span className="sync-text">
              {syncStatus === 'syncing'
                ? 'Syncing...'
                : user
                ? 'Cloud Synced'
                : 'Cloud Sync'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
