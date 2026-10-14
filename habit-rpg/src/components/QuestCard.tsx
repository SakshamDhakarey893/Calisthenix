import { useState, useEffect } from 'react';
import { DIFFICULTY_COLORS, DIFFICULTY_XP, todayISO } from '../types';
import type { Quest } from '../types';

interface Props {
  quest: Quest;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function QuestCard({ quest, onComplete, onUncomplete, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showXpPop, setShowXpPop] = useState(false);
  const [earnedXpPop, setEarnedXpPop] = useState(0);
  const [hasCrit, setHasCrit] = useState(false);
  const [animatingFlash, setAnimatingFlash] = useState(false);

  // Auto-cancel delete confirmation after 4 seconds of inactivity
  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => {
      setConfirmDelete(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);

  const today = todayISO();
  const isDone = quest.completedDates.includes(today);
  const color = DIFFICULTY_COLORS[quest.difficulty];
  const baseXP = DIFFICULTY_XP[quest.difficulty];
  const streakBonus = Math.min(quest.streak * 0.1, 1);
  const potentialXP = Math.round(baseXP * (1 + streakBonus));

  const handleToggleComplete = () => {
    if (isDone) {
      onUncomplete(quest.id);
    } else {
      setEarnedXpPop(potentialXP);
      setHasCrit(streakBonus > 0);
      setShowXpPop(true);
      setAnimatingFlash(true);

      setTimeout(() => setShowXpPop(false), 1400);
      setTimeout(() => setAnimatingFlash(false), 800);

      onComplete(quest.id);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(quest.id);
  };

  return (
    <article
      className={`quest-card ${isDone ? 'completed' : ''} ${
        quest.isDaily ? 'daily-bounty-card' : ''
      } ${animatingFlash ? 'quest-flash-anim' : ''}`}
    >
      {showXpPop && (
        <div className="floating-xp-pop" aria-live="polite">
          <span className="xp-pop-num">+{earnedXpPop} XP!</span>
          {hasCrit && <span className="xp-pop-crit">🔥 STREAK BOOST</span>}
        </div>
      )}

      <div className="quest-header">
        <span
          className="difficulty-badge"
          style={{ background: color + '22', color, borderColor: color }}
        >
          {quest.difficulty.toUpperCase()}
        </span>

        {quest.isDaily ? (
          <span className="quest-nature-badge daily-nature">⚡ DAILY</span>
        ) : quest.isRecurring ? (
          <span className="quest-nature-badge habit-nature">🔄 HABIT</span>
        ) : (
          <span className="quest-nature-badge onetime-nature">🎯 MISSION</span>
        )}

        <span className="category-tag">{quest.category}</span>

        {confirmDelete ? (
          <div className="delete-confirm-box" onClick={(e) => e.stopPropagation()}>
            <span className="confirm-text">Delete?</span>
            <button
              type="button"
              className="confirm-yes-btn"
              onClick={handleConfirmDelete}
              title="Yes, delete this quest"
              aria-label="Confirm delete"
            >
              ✓
            </button>
            <button
              type="button"
              className="confirm-no-btn"
              onClick={() => setConfirmDelete(false)}
              title="Cancel"
              aria-label="Cancel delete"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="delete-btn"
            onClick={() => setConfirmDelete(true)}
            title="Delete quest (requires confirmation)"
            aria-label="Delete quest"
          >
            ✕
          </button>
        )}
      </div>

      <h3 className="quest-title">{quest.title}</h3>
      {quest.description && <p className="quest-desc">{quest.description}</p>}

      <div className="quest-meta">
        <div className="meta-item">
          <span className="meta-label">XP</span>
          <span className="meta-value xp-value">
            +{isDone ? baseXP : potentialXP}
            {quest.streak > 0 && !isDone && (
              <span className="streak-bonus"> (+{Math.round(streakBonus * 100)}%)</span>
            )}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Streak</span>
          <span className={`meta-value ${quest.streak >= 3 ? 'streak-fire-badge' : ''}`}>
            {quest.streak > 0 ? `🔥 ${quest.streak}` : '—'}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Best</span>
          <span className="meta-value">{quest.bestStreak || '—'}</span>
        </div>
      </div>

      <button
        className={`complete-btn ${isDone ? 'done' : ''}`}
        onClick={handleToggleComplete}
      >
        {isDone ? '✓ Completed — Undo' : quest.isDaily ? '⚡ Claim Daily Bounty' : 'Complete Quest'}
      </button>
    </article>
  );
}
