import React from 'react';

interface ForgeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const ForgeInput = ({ label, className = "", ...props }: ForgeInputProps) => {
  return (
    <div className="w-full space-y-2.5">
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-forge-amber/30 focus:bg-white/[0.05] ${className}`}
        {...props}
      />
    </div>
  );
};
