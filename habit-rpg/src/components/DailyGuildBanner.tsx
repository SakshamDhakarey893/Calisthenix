import { useState, useEffect } from 'react';
import type { Quest, GameSettings } from '../types';
import { getTimeUntilMidnight, todayISO } from '../types';

interface Props {
  quests: Quest[];
  settings: GameSettings;
  onRollDailies: () => void;
  onToggleAutoDaily: () => void;
  onChangeDailyCount: (count: number) => void;
  onClearCompletedDailies: () => void;
}

export function DailyGuildBanner({
  quests,
  settings,
  onRollDailies,
  onToggleAutoDaily,
  onChangeDailyCount,
  onClearCompletedDailies,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const today = todayISO();
  const dailyQuests = quests.filter((q) => q.isDaily);
  const completedDailyToday = dailyQuests.filter((q) =>
    q.completedDates.includes(today)
  ).length;

  const totalDailies = dailyQuests.length;
  const allDailiesDone = totalDailies > 0 && completedDailyToday === totalDailies;

  return (
    <div className={`daily-guild-banner ${allDailiesDone ? 'all-completed' : ''}`}>
      <div className="daily-banner-main">
        <div className="daily-banner-info">
          <div className="daily-badge-row">
            <span className="daily-hero-badge">⚡ DAILY GUILD BOUNTIES</span>
            <span className="daily-reset-timer" title="Time until midnight automatic rollover">
              ⏳ Resets in {timeLeft.formatted}
            </span>
          </div>

          <h2 className="daily-banner-title">
            {allDailiesDone ? (
              <>🎉 All Today's Bounties Conquered!</>
            ) : totalDailies === 0 ? (
              <>No Daily Bounties Active</>
            ) : (
              <>
                Daily Progress: <span className="highlight">{completedDailyToday}/{totalDailies}</span> Completed
              </>
            )}
          </h2>

          <p className="daily-banner-sub">
            {settings.autoDailyQuests
              ? `Auto-Refresh Active: Generates ${settings.dailyQuestCount} fresh bounties every day at midnight.`
              : 'Auto-Refresh Paused: You can summon daily bounties manually.'}
          </p>
        </div>

        <div className="daily-banner-actions">
          <button
            className="btn-action summon-btn"
            onClick={onRollDailies}
            title="Summon new randomized daily bounties right now"
          >
            <span className="btn-icon">🎲</span> Roll Daily Bounties
          </button>

          <button
            className={`btn-action toggle-btn ${settings.autoDailyQuests ? 'active' : ''}`}
            onClick={onToggleAutoDaily}
            title="Toggle automated daily quest generation"
          >
            ⚡ Auto-Daily: {settings.autoDailyQuests ? 'ON' : 'OFF'}
          </button>

          <button
            className="btn-action config-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Configure Daily Quests"
          >
            ⚙️ {showSettings ? 'Close' : 'Settings'}
          </button>

          {completedDailyToday > 0 && (
            <button
              className="btn-action clear-btn"
              onClick={onClearCompletedDailies}
              title="Clear finished daily bounties from the board"
            >
              🧹 Clear Done
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="daily-settings-drawer">
          <div className="settings-row">
            <label htmlFor="daily-count-select">Bounties added automatically each day:</label>
            <div className="count-buttons">
              {[1, 2, 3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  className={`count-chip ${settings.dailyQuestCount === cnt ? 'active' : ''}`}
                  onClick={() => onChangeDailyCount(cnt)}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
          <p className="settings-hint">
            💡 Calisthenix will automatically rotate uncompleted daily challenges and refresh your active streaks every midnight.
          </p>
        </div>
      )}

      {totalDailies > 0 && (
        <div className="daily-progress-track">
          <div
            className="daily-progress-bar"
            style={{
              width: `${(completedDailyToday / totalDailies) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
