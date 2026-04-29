'use client';

import React from 'react';
import { UserStats } from '@/types';

export function StatsHeader({ stats }: { stats: UserStats }) {
  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-card-lbl">Forge Score</div>
        <div className="stat-card-val text-amber-500">{stats.forgeScore}</div>
        <div className="stat-card-sub up">Top 5% of users</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-lbl">Active Goals</div>
        <div className="stat-card-val">{stats.activeGoals}</div>
        <div className="stat-card-sub">In progress</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-lbl">Week Progress</div>
        <div className="stat-card-val">{stats.weekProgress}%</div>
        <div className="stat-card-sub up">+12% vs last week</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-lbl">Global Rank</div>
        <div className="stat-card-val">Master</div>
        <div className="stat-card-sub">Level 42</div>
      </div>
    </div>
  );
}
