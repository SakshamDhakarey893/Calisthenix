import { useState } from 'react';
import type { CharacterTier, PlayerStats, Quest } from '../types';
import {
  getCharacterTier,
  getNextCharacterTier,
  calculateHeroStats,
  CHARACTER_TIERS,
  xpProgress,
  todayISO,
} from '../types';
import { getGearLore, type GearLoreItem } from '../data/gearLore';

interface GearItemDisplay {
  key: string;
  slotLabel: string;
  name: string;
  icon: string;
  statBonus: string;
  statClass: 'str' | 'vit' | 'wis' | 'pwr';
}

interface HeroBuff {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  effect: string;
  requirement: string;
  colorClass: string;
}

function getRarityName(tierNum: number): string {
  switch (tierNum) {
    case 1:
      return 'Common';
    case 2:
      return 'Rare';
    case 3:
      return 'Epic';
    case 4:
      return 'Legendary';
    case 5:
      return 'Mythic';
    default:
      return 'Standard';
  }
}

function getGearForTier(tier: CharacterTier): GearItemDisplay[] {
  const t = tier.tier;
  return [
    {
      key: 'weapon',
      slotLabel: 'Weapon',
      name: tier.gear.weapon,
      icon: t === 1 ? '🧤' : t === 2 ? '⚡' : t === 3 ? '🥊' : t === 4 ? '🔥' : '✨',
      statBonus: `+${t * 8} STR`,
      statClass: 'str',
    },
    {
      key: 'armor',
      slotLabel: 'Armor',
      name: tier.gear.armor,
      icon: t === 1 ? '🎽' : t === 2 ? '🎽' : t === 3 ? '🛡️' : t === 4 ? '🥋' : '🛡️',
      statBonus: `+${t * 6} VIT`,
      statClass: 'vit',
    },
    {
      key: 'helm',
      slotLabel: 'Focus',
      name: tier.gear.helm,
      icon: t === 1 ? '🧘' : t === 2 ? '🧠' : t === 3 ? '⚡' : t === 4 ? '👑' : '☀️',
      statBonus: `+${t * 5} WIS`,
      statClass: 'wis',
    },
    {
      key: 'aura',
      slotLabel: 'Relic / Aura',
      name: tier.gear.aura,
      icon: t === 1 ? '✨' : t === 2 ? '💠' : t === 3 ? '🔮' : t === 4 ? '🟣' : '🪽',
      statBonus: `+${t * 15} CP`,
      statClass: 'pwr',
    },
  ];
}

interface Props {
  player: PlayerStats;
  quests: Quest[];
  justLeveled: boolean;
  waterMl?: number;
  proteinRatio?: number;
}

export function CharacterStage({ player, quests, justLeveled, waterMl, proteinRatio }: Props) {
  const currentTier = getCharacterTier(player.level);
  const nextTier = getNextCharacterTier(player.level);
  const stats = calculateHeroStats(player, quests);
  const progress = xpProgress(player.totalXP);

  const [previewTierIndex, setPreviewTierIndex] = useState<number | null>(null);
  const [selectedGear, setSelectedGear] = useState<GearLoreItem | null>(null);
  const [selectedBuff, setSelectedBuff] = useState<HeroBuff | null>(null);

  const displayTier = previewTierIndex !== null ? CHARACTER_TIERS[previewTierIndex] : currentTier;
  const isPreviewing = previewTierIndex !== null && displayTier.tier !== currentTier.tier;
  const gearList = getGearForTier(displayTier);

  // Active status buffs calculation
  const today = todayISO();

  let currentWater = waterMl ?? 0;
  let currentProteinRatio = proteinRatio ?? 0;
  try {
    const raw = localStorage.getItem('habit-rpg-nutrition-v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (waterMl === undefined && typeof parsed.consumedWaterMl === 'number') {
        currentWater = parsed.consumedWaterMl;
      }
      if (proteinRatio === undefined && parsed.targetMacros?.protein) {
        let pro = 0;
        const { breakfast, lunch, snack, dinner } = parsed.activePlan || {};
        for (const m of [breakfast, lunch, snack, dinner]) {
          if (m && parsed.eatenMealIds?.includes(m.id)) {
            pro += m.macros.protein;
          }
        }
        for (const item of parsed.customFoods || []) {
          pro += item.macros.protein;
        }
        currentProteinRatio = pro / parsed.targetMacros.protein;
      }
    }
  } catch {}

  const isHydrated = currentWater >= 2000;
  const isAnabolic = currentProteinRatio >= 1.0;
  const isStreaking = quests.some((q) => q.streak >= 3);
  const isZen = quests.some(
    (q) => (q.category === 'Mind' || q.category === 'Learning') && q.completedDates.includes(today)
  );
  const isIron = quests.some((q) => q.category === 'Body' && q.completedDates.includes(today));

  const buffs: HeroBuff[] = [
    {
      id: 'water',
      name: 'Hydrated',
      icon: '💧',
      active: isHydrated,
      effect: '+10% Physical Stamina & Recovery',
      requirement: `Drink 2.0L+ water today (${(currentWater / 1000).toFixed(1)}L logged)`,
      colorClass: 'buff-water',
    },
    {
      id: 'protein',
      name: 'Anabolic',
      icon: '🥩',
      active: isAnabolic,
      effect: '+15 STR & Muscle Protein Synthesis',
      requirement: `Hit 100% of daily protein target (${Math.round(currentProteinRatio * 100)}% reached)`,
      colorClass: 'buff-protein',
    },
    {
      id: 'streak',
      name: 'On Fire',
      icon: '🔥',
      active: isStreaking,
      effect: '1.2x Discipline XP Multiplier on all habits',
      requirement: 'Maintain a 3+ day streak on any habit',
      colorClass: 'buff-streak',
    },
    {
      id: 'zen',
      name: 'Zen Mind',
      icon: '🧘',
      active: isZen,
      effect: '+10 WIS & Unshakable Mental Clarity',
      requirement: 'Complete a Mind or Learning habit today',
      colorClass: 'buff-zen',
    },
    {
      id: 'iron',
      name: 'Iron Body',
      icon: '⚔️',
      active: isIron,
      effect: '+10 STR & Bar Transition Power',
      requirement: 'Complete a Body or Workout quest today',
      colorClass: 'buff-iron',
    },
  ];

  return (
    <aside className={`character-stage ${justLeveled ? 'tier-up-glow' : ''}`}>
      <div className="stage-header">
        <div className="tier-pill">
          <span className="tier-number">TIER {displayTier.tier}</span>
          <span className="tier-name">{displayTier.name}</span>
        </div>

        <div className="combat-power" title="Total Combat Power derived from discipline and habits">
          <span className="cp-label">CP</span>
          <span className="cp-val">{stats.power.toLocaleString()}</span>
        </div>
      </div>

      <div className="stage-frame">
        <div className={`avatar-container tier-${displayTier.tier}`}>
          <img
            src={displayTier.image}
            alt={displayTier.name}
            className="full-body-img hero-floating-avatar"
          />
          <div className="stage-pedestal" />
          <div className="stage-aura" />

          {isPreviewing && (
            <div className="preview-overlay-tag">
              👁️ Previewing Tier {displayTier.tier}
            </div>
          )}

          <div className="level-floating-badge">
            <span className="level-num">Lv {player.level}</span>
          </div>
        </div>

        {/* Tier Selector / Preview Buttons */}
        <div className="tier-nav-dots" title="Preview character evolution tiers">
          {CHARACTER_TIERS.map((tier, idx) => {
            const isUnlocked = player.level >= tier.minLevel;
            const isSelected = (previewTierIndex === null && tier.tier === currentTier.tier) || previewTierIndex === idx;
            return (
              <button
                key={tier.tier}
                type="button"
                className={`tier-dot ${isSelected ? 'selected' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                onClick={() => setPreviewTierIndex(previewTierIndex === idx ? null : idx)}
                title={`Tier ${tier.tier}: ${tier.name} (Unlocked at Lv ${tier.minLevel})`}
              >
                {isUnlocked ? `T${tier.tier}` : '🔒'}
              </button>
            );
          })}
        </div>

        {/* Hero Active Buffs Bar */}
        <div className="hero-buffs-bar">
          <div className="buffs-header">
            <span className="buffs-title">⚡ Hero Discipline Buffs</span>
            <span className="buffs-count">
              {buffs.filter((b) => b.active).length}/{buffs.length} Active
            </span>
          </div>
          <div className="buffs-list">
            {buffs.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`buff-pill ${b.colorClass} ${b.active ? 'active' : 'inactive'}`}
                onClick={() => setSelectedBuff(selectedBuff?.id === b.id ? null : b)}
                title={`${b.name} (${b.active ? 'Active' : 'Locked'}): ${b.effect}`}
              >
                <span className="buff-icon">{b.icon}</span>
                <span className="buff-name">{b.name}</span>
                {b.active && <span className="buff-indicator">●</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Buff Inspection Drawer */}
        {selectedBuff && (
          <div className="buff-detail-card" onClick={() => setSelectedBuff(null)}>
            <div className="buff-detail-header">
              <span className="buff-detail-icon">{selectedBuff.icon}</span>
              <div className="buff-detail-meta">
                <div className="buff-detail-title">
                  {selectedBuff.name}
                  <span className={`buff-state-tag ${selectedBuff.active ? 'active' : 'locked'}`}>
                    {selectedBuff.active ? '⚡ Active Buff' : '🔒 Locked'}
                  </span>
                </div>
                <div className="buff-detail-effect">{selectedBuff.effect}</div>
              </div>
            </div>
            <div className="buff-detail-req">
              <span className="req-label">Requirement:</span> {selectedBuff.requirement}
            </div>
          </div>
        )}
      </div>

      {/* Evolution Milestone */}
      <div className="evolution-card">
        {nextTier ? (
          <>
            <div className="evolution-label">
              <span>Next Evolution: <strong>{nextTier.name}</strong></span>
              <span className="milestone-badge">Lv {nextTier.minLevel}</span>
            </div>
            <div className="evolution-bar">
              <div
                className="evolution-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      ((player.level - currentTier.minLevel) /
                        (nextTier.minLevel - currentTier.minLevel)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
            <p className="evolution-sub">
              {nextTier.minLevel - player.level} level{nextTier.minLevel - player.level > 1 ? 's' : ''} until form upgrade! ({progress.current}/{progress.needed} XP to next level)
            </p>
          </>
        ) : (
          <div className="max-evolution-card">
            <span className="star-icon">👑</span>
            <span>Max Evolution Tier Achieved! True Immortal Discipline.</span>
          </div>
        )}
      </div>

      {/* Equipment Slots */}
      <div className="gear-panel">
        <div className="gear-panel-header">
          <div className="gear-heading-title">
            <span className="gear-heading-icon">⚔️</span>
            <h3 className="section-heading">Equipped Loadout</h3>
          </div>
          <span className={`gear-tier-badge tier-${displayTier.tier}`}>
            Tier {displayTier.tier} • {getRarityName(displayTier.tier)}
          </span>
        </div>

        <div className={`gear-grid tier-${displayTier.tier}`}>
          {gearList.map((g) => (
            <div
              key={g.key}
              className={`gear-slot slot-${g.key}`}
              onClick={() => {
                const lore = getGearLore(g.name);
                if (lore) setSelectedGear(lore);
              }}
              title="Click to inspect item lore & RPG stats"
            >
              <div className="gear-slot-top">
                <div className="gear-icon-wrapper">
                  <span className="gear-icon">{g.icon}</span>
                </div>
                <div className="gear-slot-meta">
                  <span className="gear-type">{g.slotLabel}</span>
                  <span className={`gear-stat-badge ${g.statClass}`}>{g.statBonus}</span>
                </div>
              </div>
              <div className="gear-name" title={g.name}>
                {g.name}
              </div>
              <span className="gear-inspect-hint">🔍 Inspect Lore</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attributes / Stats */}
      <div className="attributes-panel">
        <h3 className="section-heading">Hero Attributes</h3>
        <div className="stats-list">
          <div className="stat-row">
            <span className="stat-name">⚔️ STR (Strength)</span>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill str"
                style={{ width: `${Math.min(100, (stats.str / 150) * 100)}%` }}
              />
            </div>
            <span className="stat-num">{stats.str}</span>
          </div>

          <div className="stat-row">
            <span className="stat-name">🧠 WIS (Wisdom)</span>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill wis"
                style={{ width: `${Math.min(100, (stats.wis / 150) * 100)}%` }}
              />
            </div>
            <span className="stat-num">{stats.wis}</span>
          </div>

          <div className="stat-row">
            <span className="stat-name">❤️ VIT (Vitality)</span>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill vit"
                style={{ width: `${Math.min(100, (stats.vit / 150) * 100)}%` }}
              />
            </div>
            <span className="stat-num">{stats.vit}</span>
          </div>

          <div className="stat-row">
            <span className="stat-name">⚡ DEX (Focus)</span>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill dex"
                style={{ width: `${Math.min(100, (stats.dex / 150) * 100)}%` }}
              />
            </div>
            <span className="stat-num">{stats.dex}</span>
          </div>
        </div>
        <p className="stats-hint">
          Tip: Complete Body for STR, Mind/Learning for WIS, Health for VIT, and Work for DEX!
        </p>
      </div>

      {/* RPG Gear Lore Inspection Modal */}
      {selectedGear && (
        <div className="modal-overlay" onClick={() => setSelectedGear(null)}>
          <div
            className={`modal gear-lore-modal rarity-${selectedGear.rarity.toLowerCase()}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gear-lore-header">
              <div className="lore-gem-frame">
                <span className="lore-gem-icon">{selectedGear.icon}</span>
              </div>
              <div className="lore-title-area">
                <div className="lore-rarity-row">
                  <span className={`lore-rarity-badge ${selectedGear.rarity.toLowerCase()}`}>
                    Tier {selectedGear.tier} • {selectedGear.rarity}
                  </span>
                  <span className="lore-slot-tag">{selectedGear.slotName}</span>
                </div>
                <h3 className="lore-item-title">{selectedGear.name}</h3>
              </div>
              <button
                type="button"
                className="delete-btn lore-close-btn"
                onClick={() => setSelectedGear(null)}
                aria-label="Close lore modal"
              >
                ✕
              </button>
            </div>

            <div className="gear-lore-body">
              <blockquote className="lore-quote">{selectedGear.quote}</blockquote>
              <p className="lore-story">{selectedGear.lore}</p>

              <div className="lore-stats-section">
                <span className="lore-stats-title">Combat &amp; Athletic Attributes</span>
                <div className="lore-stats-grid">
                  {selectedGear.stats.map((s) => (
                    <div key={s.label} className="lore-stat-card">
                      <span className="stat-label">{s.label}</span>
                      <span className="stat-val" style={{ color: s.color }}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lore-origin-box">
                <span className="origin-label">Item Origin:</span>
                <span className="origin-text">{selectedGear.origin}</span>
              </div>

              <div className="lore-footer">
                <span className="bound-tag">🛡️ SOULBOUND TO DISCIPLINED HERO</span>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setSelectedGear(null)}
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
