'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'amber' | 'steel' | 'green' | 'red' | 'ghost';
  className?: string;
}

export function Badge({ children, variant = 'ghost', className = '' }: BadgeProps) {
  const baseStyles = 'badge';
  const variantStyles = {
    amber: 'badge-amber',
    steel: 'badge-steel',
    green: 'badge-green',
    red: 'badge-red',
    ghost: 'badge-ghost',
  };

  const classes = [baseStyles, variantStyles[variant], className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
