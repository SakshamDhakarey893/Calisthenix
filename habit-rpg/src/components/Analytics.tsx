import { useState, useMemo } from 'react';
import type { Quest, PlayerStats } from '../types';
import { DIFFICULTY_XP, todayISO } from '../types';

interface Props {
  quests: Quest[];
  player: PlayerStats;
}

interface HeatmapDay {
  dateStr: string;
  dayOfWeek: number; // 0=Mon, 6=Sun
  displayDate: string;
  count: number;
  questNames: string[];
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
  isFuture: boolean;
  relativeTime: string;
}

interface HeatmapColumn {
  colIdx: number;
  days: HeatmapDay[];
  monthLabel?: string;
  weekStartDate: number;
  fullStartDate: string;
}

interface HeatmapData {
  columns: HeatmapColumn[];
  startDateStr: string;
  endDateStr: string;
  todayDay: HeatmapDay | null;
  totalDays: number;
  totalWeeks: number;
  totalCompletionsInPeriod: number;
  avgQuestsPerDay: string;
}

function calculateOverallStreak(quests: Quest[]): {
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
} {
  const allDates = new Set<string>();
  quests.forEach((q) => q.completedDates.forEach((d) => allDates.add(d)));

  const sortedDates = Array.from(allDates).sort();
  const activeDaysCount = sortedDates.length;

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDaysCount: 0 };
  }

  const today = todayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let currentStreak = 0;
  const checkDate = allDates.has(today) ? new Date() : allDates.has(yesterdayStr) ? yesterday : null;

  if (checkDate) {
    const curr = new Date(checkDate);
    while (true) {
      const s = curr.toISOString().slice(0, 10);
      if (allDates.has(s)) {
        currentStreak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const d = new Date(dStr + 'T00:00:00');
    if (!prevDate) {
      running = 1;
    } else {
      const diffTime = d.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    if (running > longestStreak) longestStreak = running;
    prevDate = d;
  }

  return { currentStreak, longestStreak, activeDaysCount };
}

function getStreakMilestone(currentStreak: number) {
  const milestones = [
    { target: 3, name: 'Flame Spark', buff: '🔥 On Fire' },
    { target: 7, name: 'Iron Fortitude', buff: '⚔️ Iron Body' },
    { target: 14, name: 'Titan Discipline', buff: '🧘 Zen Mind' },
    { target: 30, name: 'Grandmaster', buff: '👑 Mythic Will' },
    { target: 60, name: 'Immortal Ascendant', buff: '✨ Ascended' },
  ];
  const next = milestones.find((m) => m.target > currentStreak) || milestones[milestones.length - 1];
  const prevTarget = milestones.slice().reverse().find((m) => m.target <= currentStreak)?.target || 0;
  const range = Math.max(1, next.target - prevTarget);
  const progress = Math.min(100, Math.round(((currentStreak - prevTarget) / range) * 100));

  return { next, progress };
}

function getDisciplineRank(consistencyRate: number): { title: string; badge: string; color: string } {
  if (consistencyRate >= 75) {
    return { title: 'Mythic Vanguard', badge: '👑', color: '#38bdf8' };
  } else if (consistencyRate >= 50) {
    return { title: 'Iron Disciplinarian', badge: '⚔️', color: '#a855f7' };
  } else if (consistencyRate >= 25) {
    return { title: 'Habit Crusader', badge: '🛡️', color: '#06b6d4' };
  } else if (consistencyRate >= 10) {
    return { title: 'Dedicated Novice', badge: '🗡️', color: '#4ade80' };
  } else {
    return { title: 'Discipline Initiate', badge: '🌱', color: '#94a3b8' };
  }
}

function generateHeatmapDays(quests: Quest[], numWeeks = 10): HeatmapData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 0 = Monday, ..., 6 = Sunday
  const todayDow = (today.getDay() + 6) % 7;
  const todayISOStr = todayISO();

  // Find Monday of the current week
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() - todayDow);

  // Start Monday is (numWeeks - 1) weeks before currentWeekMonday
  const startMonday = new Date(currentWeekMonday);
  startMonday.setDate(currentWeekMonday.getDate() - (numWeeks - 1) * 7);

  const columns: HeatmapColumn[] = [];
  let prevMonth = -1;
  let todayDayObj: HeatmapDay | null = null;
  let totalCompletionsInPeriod = 0;
  let elapsedDaysCount = 0;

  for (let w = 0; w < numWeeks; w++) {
    const colDays: HeatmapDay[] = [];
    const mondayDate = new Date(startMonday);
    mondayDate.setDate(startMonday.getDate() + w * 7);

    const weekMonth = mondayDate.getMonth();
    let monthLabel: string | undefined = undefined;

    // Show month label if this column starts a new month or week 0 is early in the month
    if (w === 0) {
      prevMonth = weekMonth;
      if (mondayDate.getDate() <= 14) {
        monthLabel = mondayDate.toLocaleDateString(undefined, { month: 'short' });
      }
    } else if (weekMonth !== prevMonth) {
      monthLabel = mondayDate.toLocaleDateString(undefined, { month: 'short' });
      prevMonth = weekMonth;
    }

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + dayIdx);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNum}`;

      const isToday = dateStr === todayISOStr;
      const isFuture = d.getTime() > today.getTime();

      const completed = quests.filter((q) => q.completedDates.includes(dateStr));
      const count = completed.length;

      // Consistency Levels (0–4):
      // Level 0: Rest / No quests completed (subtle dark glass cell)
      // Level 1: 1 quest completed (Emerald tint)
      // Level 2: 2 quests completed (Vibrant green)
      // Level 3: 3 quests completed (Neon cyan-green)
      // Level 4: 4+ quests completed (Golden glow)
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (!isFuture) {
        totalCompletionsInPeriod += count;
        elapsedDaysCount++;

        if (count >= 4) level = 4;
        else if (count === 3) level = 3;
        else if (count === 2) level = 2;
        else if (count === 1) level = 1;
        else level = 0;
      }

      // Calculate relative days
      const diffDays = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      let relativeTime = '';
      if (isToday) {
        relativeTime = 'Today';
      } else if (diffDays === 1) {
        relativeTime = 'Yesterday';
      } else if (diffDays > 1) {
        relativeTime = `${diffDays} days ago`;
      } else if (diffDays === -1) {
        relativeTime = 'Tomorrow';
      } else if (diffDays < -1) {
        relativeTime = `In ${Math.abs(diffDays)} days`;
      }

      const dayObj: HeatmapDay = {
        dateStr,
        dayOfWeek: dayIdx,
        displayDate: d.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        count,
        questNames: completed.map((q) => q.title),
        level,
        isToday,
        isFuture,
        relativeTime,
      };

      if (isToday) {
        todayDayObj = dayObj;
      }

      colDays.push(dayObj);
    }

    columns.push({
      colIdx: w,
      days: colDays,
      monthLabel,
      weekStartDate: mondayDate.getDate(),
      fullStartDate: mondayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    });
  }

  const avgQuestsPerDay = (totalCompletionsInPeriod / Math.max(1, elapsedDaysCount)).toFixed(1);

  return {
    columns,
    startDateStr: startMonday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    endDateStr: today.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    todayDay: todayDayObj,
    totalDays: numWeeks * 7,
    totalWeeks: numWeeks,
    totalCompletionsInPeriod,
    avgQuestsPerDay,
  };
}

export function Analytics({ quests, player }: Props) {
  const today = todayISO();
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  const stats = useMemo(() => {
    const totalCompletions = quests.reduce((s, q) => s + q.completedDates.length, 0);
    const activeStreaks = quests.filter((q) => q.streak > 0).length;
    const bestStreak = Math.max(0, ...quests.map((q) => q.bestStreak));
    const completedToday = quests.filter((q) => q.completedDates.includes(today)).length;
    const completionRateToday =
      quests.length > 0 ? Math.round((completedToday / quests.length) * 100) : 0;

    const streakData = calculateOverallStreak(quests);
    const heatmapData = generateHeatmapDays(quests, 10); // full 10-week (70-day) discipline heatmap

    // XP by difficulty
    const xpByDiff = { easy: 0, medium: 0, hard: 0, epic: 0 };
    quests.forEach((q) => {
      const xp = DIFFICULTY_XP[q.difficulty] * q.completedDates.length;
      xpByDiff[q.difficulty] += xp;
    });

    // Category breakdown
    const catMap: Record<string, number> = {};
    quests.forEach((q) => {
      catMap[q.category] = (catMap[q.category] || 0) + q.completedDates.length;
    });
    const categories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const consistencyRate = Math.round((streakData.activeDaysCount / heatmapData.totalDays) * 100);
    const disciplineRank = getDisciplineRank(consistencyRate);
    const milestone = getStreakMilestone(streakData.currentStreak);

    return {
      totalCompletions,
      activeStreaks,
      bestStreak,
      completedToday,
      completionRateToday,
      streakData,
      heatmapData,
      consistencyRate,
      disciplineRank,
      milestone,
      xpByDiff,
      categories,
    };
  }, [quests, today]);

  const activeInspectionDay = hoveredDay || stats.heatmapData.todayDay;

  return (
    <div className="analytics">
      <div className="analytics-header-row">
        <div>
          <span className="analytics-tag">DISCIPLINE METRICS LAB</span>
          <h2 className="section-title">Hero Analytics &amp; Habit Heatmap</h2>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{player.totalXP.toLocaleString()}</span>
          <span className="stat-label">Total Earned XP</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalCompletions}</span>
          <span className="stat-label">Total Habits Finished</span>
        </div>
        <div className="stat-card">
          <span className="stat-value highlight-fire">{stats.streakData.currentStreak} Days</span>
          <span className="stat-label">Current Active Streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-value highlight-purple">{stats.streakData.longestStreak} Days</span>
          <span className="stat-label">Longest Historical Streak</span>
        </div>
      </div>

      {/* 70-Day Discipline Consistency Heatmap Section (Option 4) */}
      <section className="heatmap-section-card">
        <div className="heatmap-header">
          <div className="heatmap-title-block">
            <span className="heatmap-icon">📅</span>
            <div>
              <div className="heatmap-title-row">
                <h3 className="heatmap-title">70-Day Discipline Consistency Heatmap (Last 10 Weeks)</h3>
                <span className="heatmap-range-badge">
                  {stats.heatmapData.startDateStr} — {stats.heatmapData.endDateStr} (70 Days)
                </span>
              </div>
              <p className="heatmap-sub">
                Every colored square represents habits executed and daily bounties conquered.
              </p>
            </div>
          </div>

          {/* Discipline Stats Strip */}
          <div className="heatmap-kpi-chips">
            <div className="kpi-chip highlight-chip">
              <span className="kpi-val">🔥 {stats.streakData.currentStreak}d</span>
              <span className="kpi-label">Current Streak</span>
            </div>
            <div className="kpi-chip highlight-purple-chip">
              <span className="kpi-val">🏆 {stats.streakData.longestStreak}d</span>
              <span className="kpi-label">Longest Streak</span>
            </div>
            <div className="kpi-chip">
              <span className="kpi-val">{stats.streakData.activeDaysCount} Days</span>
              <span className="kpi-label">Total Active Days</span>
            </div>
            <div className="kpi-chip highlight-cyan-chip">
              <span className="kpi-val">⚡ {stats.heatmapData.avgQuestsPerDay}</span>
              <span className="kpi-label">Avg Quests / Day</span>
            </div>
          </div>
        </div>

        {/* Heatmap Main Content Layout: Grid View + Right Side Insights */}
        <div className="heatmap-main-layout">
          {/* Left / Main View: Matrix & Inspector */}
          <div className="heatmap-matrix-area">
            {/* Scrollable Container (overflow-y hidden, scrollbar completely removed) */}
            <div className="heatmap-scroll-area">
              <div className="heatmap-grid-flex">
                {/* Day of Week Column */}
                <div className="heatmap-dow-col">
                  <div className="dow-spacer" />
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Week Columns (10 Weeks / 70 Days) */}
                <div className="heatmap-columns">
                  {stats.heatmapData.columns.map((col) => (
                    <div key={col.colIdx} className="heatmap-col">
                      {/* Column Header: Month & Date */}
                      <div className="heatmap-col-header" title={`Week starting ${col.fullStartDate}`}>
                        <span className="col-month-tag">{col.monthLabel || ''}</span>
                        <span className="col-date-tag">{col.weekStartDate}</span>
                      </div>

                      {/* 7 Days in Week */}
                      {col.days.map((day) => (
                        <div
                          key={day.dateStr}
                          className={`heatmap-cell ${
                            day.isFuture
                              ? 'future'
                              : `level-${day.level}`
                          } ${day.isToday ? 'is-today' : ''} ${
                            activeInspectionDay?.dateStr === day.dateStr ? 'hovered' : ''
                          }`}
                          onMouseEnter={() => setHoveredDay(day)}
                          onClick={() => setHoveredDay(day)}
                          title={`${day.displayDate}: ${
                            day.isFuture
                              ? 'Upcoming'
                              : day.count > 0
                              ? `${day.count} completed`
                              : 'Rest / Inactive'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Hover Inspector Card & Legend */}
            <div className="heatmap-footer-row">
              <div className="hovered-day-info">
                {activeInspectionDay && (
                  <div className="hdi-content">
                    <span className="hdi-date">
                      {activeInspectionDay.displayDate}
                      {activeInspectionDay.isToday ? (
                        <span className="today-badge">TODAY</span>
                      ) : activeInspectionDay.relativeTime ? (
                        <span className="relative-tag">({activeInspectionDay.relativeTime})</span>
                      ) : null}
                    </span>
                    <span className="hdi-count">
                      {activeInspectionDay.isFuture ? (
                        '⏳ Upcoming Day'
                      ) : activeInspectionDay.count === 0 ? (
                        '💤 Rest / No quests completed'
                      ) : activeInspectionDay.count === 1 ? (
                        '🌱 1 quest completed (Emerald tint)'
                      ) : activeInspectionDay.count === 2 ? (
                        '🌿 2 quests completed (Vibrant green)'
                      ) : activeInspectionDay.count === 3 ? (
                        '⚡ 3 quests completed (Neon cyan-green)'
                      ) : (
                        `👑 ${activeInspectionDay.count} quests completed (Golden glow)`
                      )}
                    </span>
                    {activeInspectionDay.questNames.length > 0 && (
                      <span className="hdi-names">
                        Specific Quests: {activeInspectionDay.questNames.join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Legend with exact consistency level descriptions */}
              <div className="heatmap-legend">
                <span className="legend-label">Less</span>
                <div className="legend-cell level-0" title="Level 0: Rest / No quests completed" />
                <div className="legend-cell level-1" title="Level 1: 1 quest completed (Emerald tint)" />
                <div className="legend-cell level-2" title="Level 2: 2 quests completed (Vibrant green)" />
                <div className="legend-cell level-3" title="Level 3: 3 quests completed (Neon cyan-green)" />
                <div className="legend-cell level-4" title="Level 4: 4+ quests completed (Golden glow)" />
                <span className="legend-label">More</span>
              </div>
            </div>
          </div>

          {/* Right Side: Discipline Insights & Milestones Panel */}
          <div className="heatmap-insights-card">
            <div className="insights-header">
              <span className="insights-badge-icon">{stats.disciplineRank.badge}</span>
              <div>
                <span className="insights-sub">DISCIPLINE RANK</span>
                <h4 className="insights-rank" style={{ color: stats.disciplineRank.color }}>
                  {stats.disciplineRank.title}
                </h4>
              </div>
            </div>

            <div className="insights-stats-grid">
              <div className="insight-stat">
                <span className="is-val">🔥 {stats.streakData.currentStreak}d</span>
                <span className="is-lbl">Active Streak</span>
              </div>
              <div className="insight-stat">
                <span className="is-val">🏆 {stats.streakData.longestStreak}d</span>
                <span className="is-lbl">Best Streak</span>
              </div>
              <div className="insight-stat">
                <span className="is-val">⚔️ {stats.totalCompletions}</span>
                <span className="is-lbl">Total Habits Done</span>
              </div>
              <div className="insight-stat">
                <span className="is-val">⚡ {stats.completedToday}</span>
                <span className="is-lbl">Done Today</span>
              </div>
            </div>

            <div className="insight-milestone">
              <div className="im-header">
                <span className="im-title">Next: {stats.milestone.next.name}</span>
                <span className="im-target">{stats.milestone.next.target} Days</span>
              </div>
              <div className="im-bar-track">
                <div className="im-bar-fill" style={{ width: `${stats.milestone.progress}%` }} />
              </div>
              <span className="im-buff-hint">Unlocks: {stats.milestone.next.buff}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Breakdown Row: Categories & XP by Difficulty */}
      <div className="two-col">
        <div className="chart-section">
          <h3>Category Distribution</h3>
          <div className="cat-bars">
            {stats.categories.map(([cat, count]) => {
              const maxCat = Math.max(1, ...stats.categories.map((c) => c[1]));
              return (
                <div key={cat} className="diff-row">
                  <span className="diff-name">{cat}</span>
                  <div className="diff-track">
                    <div
                      className="diff-fill"
                      style={{
                        width: `${(count / maxCat) * 100}%`,
                        background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                      }}
                    />
                  </div>
                  <span className="diff-val">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-section">
          <h3>XP by Difficulty</h3>
          <div className="diff-bars">
            {(Object.keys(stats.xpByDiff) as Array<keyof typeof stats.xpByDiff>).map((diff) => {
              const val = stats.xpByDiff[diff];
              const max = Math.max(1, ...Object.values(stats.xpByDiff));
              const colors: Record<string, string> = {
                easy: '#4ade80',
                medium: '#60a5fa',
                hard: '#f97316',
                epic: '#a855f7',
              };
              return (
                <div key={diff} className="diff-row">
                  <span className="diff-name">{diff}</span>
                  <div className="diff-track">
                    <div
                      className="diff-fill"
                      style={{
                        width: `${(val / max) * 100}%`,
                        background: colors[diff],
                      }}
                    />
                  </div>
                  <span className="diff-val">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
