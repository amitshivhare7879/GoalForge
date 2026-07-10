'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowUpCircle, Download, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function UpdateChecker() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [localBuild, setLocalBuild] = useState<string>('');
  const [localVersion, setLocalVersion] = useState<string>('');

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        // Dynamically import Capacitor so it doesn't break during server-side rendering
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) {
          return; // Skip update checking if running in a regular web browser
        }
        setIsCapacitor(true);

        const { App } = await import('@capacitor/app');
        const info = await App.getInfo();
        setLocalBuild(info.build);
        setLocalVersion(info.version);

        const supabase = createClient();
        const { data, error } = await supabase
          .from('app_versions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching app updates:', error);
          return;
        }

        if (data) {
          const currentBuildCode = parseInt(info.build, 10) || 1;
          const latestBuildCode = parseInt(data.version_code, 10);

          if (latestBuildCode > currentBuildCode) {
            setUpdateInfo(data);
            setIsUpdateAvailable(true);
          }
        }
      } catch (err) {
        console.error('Failed to run update check:', err);
      }
    };

    checkUpdates();
  }, []);

  const handleUpdate = () => {
    if (updateInfo?.download_url) {
      // _system tells Capacitor to open it in the system's default browser, 
      // which will trigger the direct download of the APK from the GitHub Release
      window.open(updateInfo.download_url, '_system');
    }
  };

  if (!isUpdateAvailable || !updateInfo) return null;

  const isMandatory = updateInfo.is_mandatory;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          style={{
            background: 'var(--bg2, #141416)',
            border: '1px solid var(--amberDim, rgba(245, 166, 35, 0.2))',
            borderRadius: 20,
            width: '100%',
            maxWidth: 420,
            padding: '28px 24px',
            boxShadow: '0 25px 50px -12px rgba(245, 166, 35, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            position: 'relative'
          }}
        >
          {/* Close button (only if not mandatory) */}
          {!isMandatory && (
            <button
              onClick={() => setIsUpdateAvailable(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'var(--surf2, #232326)',
                border: '1px solid var(--border, #2d2d30)',
                color: 'var(--text3, #8f90a6)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              <X size={16} />
            </button>
          )}

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--amberDim, rgba(245, 166, 35, 0.1))',
              border: '1px solid var(--amber, #f5a623)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--amber, #f5a623)'
            }}>
              <ArrowUpCircle size={32} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text, #f3f3f3)' }}>Update Available</h3>
              <p style={{ fontSize: 13, color: 'var(--text3, #8f90a6)', margin: 0 }}>
                Version {updateInfo.version_name} (Build {updateInfo.version_code}) is now ready.
              </p>
            </div>
          </div>

          {/* Release Notes */}
          {updateInfo.release_notes && (
            <div style={{
              background: 'var(--bg3, #0b0b0d)',
              border: '1px solid var(--border, #2d2d30)',
              borderRadius: 12,
              padding: '14px 16px',
              maxHeight: 120,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber, #f5a623)' }}>
                What's New:
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2, #c7c7cc)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {updateInfo.release_notes}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <button
              onClick={handleUpdate}
              style={{
                background: 'var(--amber, #f5a623)',
                color: '#0b0b0d',
                border: 'none',
                borderRadius: 12,
                padding: '14px',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(245, 166, 35, 0.3)'
              }}
            >
              <Download size={16} /> Download & Install Update
            </button>

            {!isMandatory && (
              <button
                onClick={() => setIsUpdateAvailable(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--text2, #c7c7cc)',
                  border: '1px solid var(--border, #2d2d30)',
                  borderRadius: 12,
                  padding: '12px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Maybe Later
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
