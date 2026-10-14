import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { useNutrition } from './hooks/useNutrition';
import { useCloudSync } from './hooks/useCloudSync';
import { Header } from './components/Header';
import { QuestCard } from './components/QuestCard';
import { AddQuestModal } from './components/AddQuestModal';
import { Analytics } from './components/Analytics';
import { DailyGuildBanner } from './components/DailyGuildBanner';
import { CharacterStage } from './components/CharacterStage';
import { DietPlanView } from './components/DietPlanView';
import { CloudSyncModal } from './components/CloudSyncModal';
import { todayISO, getCharacterTier } from './types';
import './App.css';

type Tab = 'quests' | 'diet' | 'analytics';
type Filter = 'all' | 'daily' | 'habits' | 'pending' | 'completed';

function App() {
  const {
    appData,
    replaceData,
    quests,
    player,
    settings,
    dailyNotice,
    dismissDailyNotice,
    addQuest,
    deleteQuest,
    completeQuest,
    uncompleteQuest,
    rewardDirectXP,
    resetAll,
    justLeveled,
    rollDailyQuests,
    toggleAutoDaily,
    setDailyQuestCount,
    clearCompletedDailyQuests,
  } = useGame();

  const nutritionManager = useNutrition(rewardDirectXP);

  const cloudSync = useCloudSync(
    appData,
    replaceData,
    nutritionManager.nutrition,
    nutritionManager.replaceNutrition
  );

  const [tab, setTab] = useState<Tab>('quests');
  const [showAdd, setShowAdd] = useState(false);
  const [showMobileHero, setShowMobileHero] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const today = todayISO();
  const completedToday = quests.filter((q) =>
    q.completedDates.includes(today)
  ).length;

  const currentTier = getCharacterTier(player.level);

  // Filtered quest list
  const filteredQuests = quests.filter((q) => {
    const isDone = q.completedDates.includes(today);
    if (filter === 'daily') return q.isDaily;
    if (filter === 'habits') return q.isRecurring && !q.isDaily;
    if (filter === 'pending') return !isDone;
    if (filter === 'completed') return isDone;
    return true;
  });

  return (
    <div className="app">
      <div className="bg-glow" />
      <div className="container">
        {dailyNotice && (
          <div className="daily-notice-toast">
            <span className="notice-icon">🌅</span>
            <div className="notice-text">{dailyNotice}</div>
            <button
              className="notice-dismiss"
              onClick={dismissDailyNotice}
              aria-label="Dismiss notice"
            >
              ✕
            </button>
          </div>
        )}

        <Header
          player={player}
          justLeveled={justLeveled}
          user={cloudSync.user}
          syncStatus={cloudSync.syncStatus}
          onOpenSyncModal={() => setShowSyncModal(true)}
        />

        <div className="app-columns">
          {/* Main Quest / Diet / Analytics Area */}
          <main className="main-board">
            <nav className="tabs">
              <button
                className={tab === 'quests' ? 'active' : ''}
                onClick={() => setTab('quests')}
              >
                Quest Board
                <span className="tab-badge">
                  {completedToday}/{quests.length}
                </span>
              </button>
              <button
                className={tab === 'diet' ? 'active' : ''}
                onClick={() => setTab('diet')}
              >
                🥗 Diet &amp; Macros
              </button>
              <button
                className={tab === 'analytics' ? 'active' : ''}
                onClick={() => setTab('analytics')}
              >
                Analytics
              </button>
            </nav>

            {tab === 'quests' && (
              <>
                <DailyGuildBanner
                  quests={quests}
                  settings={settings}
                  onRollDailies={() => rollDailyQuests()}
                  onToggleAutoDaily={toggleAutoDaily}
                  onChangeDailyCount={setDailyQuestCount}
                  onClearCompletedDailies={clearCompletedDailyQuests}
                />

                <div className="quest-actions-row">
                  <div className="filter-chips">
                    <button
                      className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
                      onClick={() => setFilter('all')}
                    >
                      All ({quests.length})
                    </button>
                    <button
                      className={`filter-chip ${filter === 'daily' ? 'active' : ''}`}
                      onClick={() => setFilter('daily')}
                    >
                      ⚡ Daily Bounties ({quests.filter((q) => q.isDaily).length})
                    </button>
                    <button
                      className={`filter-chip ${filter === 'habits' ? 'active' : ''}`}
                      onClick={() => setFilter('habits')}
                    >
                      🔄 Habits ({quests.filter((q) => q.isRecurring && !q.isDaily).length})
                    </button>
                    <button
                      className={`filter-chip ${filter === 'pending' ? 'active' : ''}`}
                      onClick={() => setFilter('pending')}
                    >
                      ⏳ Pending ({quests.length - completedToday})
                    </button>
                    <button
                      className={`filter-chip ${filter === 'completed' ? 'active' : ''}`}
                      onClick={() => setFilter('completed')}
                    >
                      ✓ Done ({completedToday})
                    </button>
                  </div>

                  <div className="action-buttons">
                    <button className="btn-primary add-btn" onClick={() => setShowAdd(true)}>
                      + New Quest
                    </button>
                    <button className="btn-ghost" onClick={resetAll} title="Reset all data">
                      Reset
                    </button>
                  </div>
                </div>

                {filteredQuests.length === 0 ? (
                  <div className="empty-state">
                    <p>
                      {filter === 'all'
                        ? 'No quests yet. Create your first one or roll new daily bounties!'
                        : `No quests match the "${filter}" filter.`}
                    </p>
                    <div className="empty-actions">
                      <button className="btn-primary" onClick={() => setShowAdd(true)}>
                        Create Quest
                      </button>
                      <button className="btn-secondary" onClick={() => rollDailyQuests()}>
                        🎲 Roll Daily Bounties
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="quest-grid">
                    {filteredQuests.map((q) => (
                      <QuestCard
                        key={q.id}
                        quest={q}
                        onComplete={completeQuest}
                        onUncomplete={uncompleteQuest}
                        onDelete={deleteQuest}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'diet' && (
              <DietPlanView
                onRewardXP={rewardDirectXP}
                nutritionManager={nutritionManager}
              />
            )}

            {tab === 'analytics' && <Analytics quests={quests} player={player} />}
          </main>

          {/* Right Column: Full Body Character Stage */}
          <div className="character-column">
            <CharacterStage
              player={player}
              quests={quests}
              justLeveled={justLeveled}
            />
          </div>
        </div>
      </div>

      {/* Floating button for mobile screens to open the Character Stage */}
      <button
        className="mobile-hero-fab"
        onClick={() => setShowMobileHero(true)}
        title="View Character Full Body & Gear"
      >
        <span className="fab-icon">⚔️</span>
        <span className="fab-label">Hero (Lv {player.level})</span>
      </button>

      {/* Mobile Character Stage Modal */}
      {showMobileHero && (
        <div className="modal-overlay" onClick={() => setShowMobileHero(false)}>
          <div className="modal mobile-hero-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Hero Stage</h3>
              <button className="delete-btn" onClick={() => setShowMobileHero(false)}>✕</button>
            </div>
            <CharacterStage
              player={player}
              quests={quests}
              justLeveled={justLeveled}
            />
          </div>
        </div>
      )}

      <AddQuestModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addQuest}
      />

      <CloudSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        user={cloudSync.user}
        syncStatus={cloudSync.syncStatus}
        lastSyncTime={cloudSync.lastSyncTime}
        cloudError={cloudSync.cloudError}
        onPushToCloud={cloudSync.pushToCloud}
        onPullFromCloud={cloudSync.pullFromCloud}
        onExportSave={cloudSync.exportSaveFile}
        onImportSave={cloudSync.importSaveFile}
        onConfigChanged={cloudSync.refreshConfigState}
      />

      {justLeveled && (
        <div className="level-up-overlay">
          <div className="level-up-card">
            <span className="level-up-icon">⚔️</span>
            <h2>LEVEL UP!</h2>
            <p>
              You have attained Level {player.level} — {player.title}!
            </p>
            <div className="level-up-tier-note">
              Form: <strong>{currentTier.name}</strong> (Tier {currentTier.tier})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
