'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/shared/Badge';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Goal } from '@/types';

export function GoalCard({ goal }: { goal: Goal }) {
  const router = useRouter();

  const getBadgeVariant = (category: string) => {
    switch(category?.toLowerCase()) {
      case 'skill': return 'amber';
      case 'build': return 'steel';
      case 'fitness': return 'green';
      default: return 'amber';
    }
  };

  return (
    <div 
      className="goal-card" 
      onClick={() => router.push(`/goals/${goal.id}`)}
    >
      <div className="goal-card-header">
        <div>
          <Badge variant={getBadgeVariant(goal.category)} className="mb-2">
            {goal.category}
          </Badge>
          <div className="goal-card-title">{goal.title}</div>
        </div>
      </div>
      
      <div className="goal-card-meta mb-3">
        {goal.description.length > 60 
          ? goal.description.substring(0, 60) + '...' 
          : goal.description}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="goal-prog-label">Progress</span>
          <span className="goal-prog-val">{goal.progress}%</span>
        </div>
        <ProgressBar progress={goal.progress} variant={getBadgeVariant(goal.category)} />
      </div>

      <div className="goal-card-footer">
        <div className="plan-stake-lbl">Locked Stake</div>
        <div className="plan-stake">{goal.stake}</div>
      </div>
    </div>
  );
}
