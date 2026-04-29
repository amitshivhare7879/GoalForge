import React from 'react';
import { Navigation } from '@/components/landing/Navigation';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div id="page-landing" className="page active">
      <div className="l-grid"></div>
      <div className="l-glow l-glow-a"></div>
      <div className="l-glow l-glow-b"></div>

      <Navigation />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
