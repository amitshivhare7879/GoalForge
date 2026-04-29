'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 24, className = '', fullScreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <Loader2 
      className={`animate-spin text-forge-amber ${className}`} 
      style={{ width: size, height: size }} 
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center p-4">{spinner}</div>;
}
