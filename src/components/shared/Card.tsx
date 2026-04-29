'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default';
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  size = 'default',
  hoverable = false,
  onClick
}: CardProps) {
  const baseStyles = 'card';
  const sizeStyles = size === 'sm' ? 'card-sm' : '';
  const hoverStyles = hoverable ? 'card-hover cursor-pointer' : '';

  const classes = [baseStyles, sizeStyles, hoverStyles, className].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
