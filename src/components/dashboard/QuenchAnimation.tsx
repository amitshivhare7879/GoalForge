'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check, ShieldCheck, Zap } from 'lucide-react';

interface QuenchAnimationProps {
  status: 'Active' | 'Completed' | 'Failed';
  onComplete?: () => void;
}

export const QuenchAnimation = ({ status, onComplete }: QuenchAnimationProps) => {
  const [isQuenched, setIsQuenched] = useState(false);

  useEffect(() => {
    if (status === 'Completed' && !isQuenched) {
      const timer = setTimeout(() => {
        setIsQuenched(true);
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, isQuenched, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-48 h-48 mb-8">
        {/* Glow Effects */}
        <AnimatePresence>
          {!isQuenched ? (
            <motion.div
              key="hot-glow"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.3, 0.6, 0.3],
                rotate: 360
              }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-amber-500/20 blur-3xl"
            />
          ) : (
            <motion.div
              key="cool-glow"
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ 
                scale: [1, 1.1, 1], 
                opacity: [0.2, 0.4, 0.2] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl"
            />
          )}
        </AnimatePresence>

        {/* Main Orb */}
        <motion.div
          animate={{
            borderColor: isQuenched ? 'rgba(123,163,200,0.3)' : 'rgba(245,166,35,0.4)',
            background: isQuenched 
              ? 'radial-gradient(circle, rgba(123,163,200,0.15) 0%, rgba(123,163,200,0.05) 100%)'
              : 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, rgba(245,166,35,0.05) 100%)',
          }}
          className="absolute inset-0 rounded-full border-2 flex items-center justify-center backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {!isQuenched ? (
              <motion.div
                key="hot-icon"
                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.2, opacity: 0, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Flame size={64} className="text-amber-500 fill-amber-500/20" />
              </motion.div>
            ) : (
              <motion.div
                key="cool-icon"
                initial={{ scale: 0.2, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                <ShieldCheck size={64} className="text-blue-400 fill-blue-400/10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Steam / Particles for Quench Moment */}
          {status === 'Completed' && (
            <div className="absolute inset-0 overflow-visible pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={!isQuenched ? {} : {
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 2],
                    x: (Math.random() - 0.5) * 150,
                    y: (Math.random() - 0.5) * 150 - 50,
                  }}
                  transition={{ duration: 1.5, delay: 0.1 * i }}
                  className={`absolute left-1/2 top-1/2 w-4 h-4 rounded-full blur-md ${isQuenched ? 'bg-white/20' : 'bg-amber-500/40'}`}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Orbiting Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 rounded-full border border-white/5 border-dashed"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-2xl font-serif mb-2 text-white">
          {!isQuenched ? 'Forging in Progress...' : 'Steel Hardened.'}
        </h3>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
          {!isQuenched 
            ? 'The protocol is active. Every day adds heat. Consistency is the hammer.' 
            : 'The quench is complete. Your discipline has been forged into character.'}
        </p>
      </motion.div>

      {isQuenched && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2"
        >
          <Zap size={14} className="text-green-500" />
          <span className="text-xs font-bold text-green-500 uppercase tracking-wider">+50 FORGE SCORE EARNED</span>
        </motion.div>
      )}
    </div>
  );
};
