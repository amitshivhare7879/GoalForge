'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: 'amber' | 'steel' | 'green';
  className?: string;
}

export function ProgressBar({ progress, variant = 'amber', className = '' }: ProgressBarProps) {
  const fillStyles = {
    amber: 'prog-amber',
    steel: 'prog-steel',
    green: 'prog-green',
  };

  return (
    <div className={`prog-track ${className}`}>
      <div 
        className={`prog-fill ${fillStyles[variant]}`} 
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} 
      />
    </div>
  );
}
