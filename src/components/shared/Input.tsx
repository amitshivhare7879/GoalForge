'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label className="label">{label}</label>}
        <input 
          ref={ref}
          className={`input ${error ? '!border-red-500' : ''} ${className}`} 
          {...props} 
        />
        {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
