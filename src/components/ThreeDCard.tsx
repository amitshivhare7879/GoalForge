'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
}

export const ThreeDCard = ({ children, className = "" }: ThreeDCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-[2rem] border border-forge-border/40 bg-forge-surface/30 backdrop-blur-xl transition-colors hover:border-forge-amber/50 ${className}`}
    >
      <div
        style={{
          transform: "translateZ(50px)",
          transformStyle: "preserve-3d",
        }}
        className="h-full w-full"
      >
        {children}
      </div>
      
      {/* Shine effect */}
      <motion.div 
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          transform: "translateZ(2px)",
        }}
      />
    </motion.div>
  );
};
