import React from 'react';
import { Loader2 } from 'lucide-react';

interface ForgeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const ForgeButton = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = "", 
  disabled,
  ...props 
}: ForgeButtonProps) => {
  const baseStyles = "relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-8 py-4 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-white text-black hover:bg-[#e5e5e7] hover:scale-[1.01]",
    secondary: "border border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10",
    ghost: "text-white/40 hover:text-white transition-colors"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};
