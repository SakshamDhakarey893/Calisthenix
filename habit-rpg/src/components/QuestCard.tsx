import { DIFFICULTY_COLORS, DIFFICULTY_XP, todayISO } from '../types';
import type { Quest } from '../types';

interface Props {
  quest: Quest;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function QuestCard({ quest, onComplete, onUncomplete, onDelete }: Props) {
  const today = todayISO();
  const isDone = quest.completedDates.includes(today);
  const color = DIFFICULTY_COLORS[quest.difficulty];
  const baseXP = DIFFICULTY_XP[quest.difficulty];
  const streakBonus = Math.min(quest.streak * 0.1, 1);
  const potentialXP = Math.round(baseXP * (1 + streakBonus));

  return (
    <article
      className={`quest-card ${isDone ? 'completed' : ''} ${
        quest.isDaily ? 'daily-bounty-card' : ''
      }`}
    >
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

        <button
          className="delete-btn"
          onClick={() => onDelete(quest.id)}
          title="Delete quest"
          aria-label="Delete"
        >
          ✕
        </button>
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
          <span className="meta-value">
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
        onClick={() => (isDone ? onUncomplete(quest.id) : onComplete(quest.id))}
      >
        {isDone ? '✓ Completed — Undo' : quest.isDaily ? '⚡ Claim Daily Bounty' : 'Complete Quest'}
      </button>
    </article>
  );
}
