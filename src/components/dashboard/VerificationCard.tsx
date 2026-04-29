'use client';

import React from 'react';
import { Verification } from '@/types';

export function VerificationCard({ verification }: { verification: Verification }) {
  const getDotClass = () => {
    switch (verification.status) {
      case 'connected': return 'connected';
      case 'pending': return 'disconnected'; // Or a yellow variant if added to CSS
      case 'failed': return 'disconnected'; // Red variant could be added
      default: return 'disconnected';
    }
  };

  const getServiceName = () => {
    switch (verification.service) {
      case 'github': return 'GitHub Commits';
      case 'calendar': return 'Google Calendar';
      case 'health': return 'Apple Health';
      case 'gps': return 'GPS Geofencing';
      default: return verification.service;
    }
  };

  return (
    <div className="verif-pill">
      <div className={`verif-dot ${getDotClass()}`} />
      <div>
        <div className="verif-name">{getServiceName()}</div>
        <div className="verif-status capitalize">
          {verification.status} {verification.lastSync ? `· Last sync ${verification.lastSync}` : ''}
        </div>
      </div>
    </div>
  );
}
