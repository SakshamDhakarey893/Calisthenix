import { useState } from 'react';
import type { Difficulty } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (
    title: string,
    description: string,
    difficulty: Difficulty,
    category: string,
    isDaily?: boolean,
    isRecurring?: boolean
  ) => void;
}

const CATEGORIES = ['Mind', 'Body', 'Work', 'Learning', 'Health', 'Social', 'Creative', 'Other'];

type QuestTypeMode = 'habit' | 'daily' | 'onetime';

export function AddQuestModal({ open, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [category, setCategory] = useState('Mind');
  const [questType, setQuestType] = useState<QuestTypeMode>('habit');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const isDaily = questType === 'daily';
    const isRecurring = questType === 'habit';

    onAdd(title.trim(), description.trim(), difficulty, category, isDaily, isRecurring);
    setTitle('');
    setDescription('');
    setDifficulty('medium');
    setCategory('Mind');
    setQuestType('habit');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New Quest</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Quest Title *
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 20 pages"
              autoFocus
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={2}
            />
          </label>

          <label>
            Quest Type
            <div className="type-buttons">
              <button
                type="button"
                className={`type-btn ${questType === 'habit' ? 'active' : ''}`}
                onClick={() => setQuestType('habit')}
                title="Repeats every day and builds your streak"
              >
                🔄 Daily Habit
              </button>
              <button
                type="button"
                className={`type-btn ${questType === 'daily' ? 'active' : ''}`}
                onClick={() => setQuestType('daily')}
                title="Single-day bounty for today"
              >
                ⚡ Daily Bounty
              </button>
              <button
                type="button"
                className={`type-btn ${questType === 'onetime' ? 'active' : ''}`}
                onClick={() => setQuestType('onetime')}
                title="Single one-time achievement"
              >
                🎯 One-Time
              </button>
            </div>
          </label>

          <label>
            Difficulty
            <div className="diff-buttons">
              {(['easy', 'medium', 'hard', 'epic'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`diff-btn ${difficulty === d ? 'active' : ''} ${d}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </label>

          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Quest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
