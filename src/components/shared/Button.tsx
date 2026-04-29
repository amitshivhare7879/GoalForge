'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'amber' | 'ghost' | 'surface' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'surface',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'btn';
  const variantStyles = {
    amber: 'btn-amber',
    ghost: 'btn-ghost',
    surface: 'btn-surface',
    danger: 'btn-danger',
  };
  const sizeStyles = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  const classes = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? 'btn-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classes} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : leftIcon ? (
        leftIcon
      ) : null}
      
      {children}
      
      {!isLoading && rightIcon && rightIcon}
    </button>
  );
}
