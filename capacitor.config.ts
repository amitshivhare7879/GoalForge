import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goalforge.app',
  appName: 'GoalForge',
  webDir: 'out',
  server: {
    url: 'https://goal-forge-sigma.vercel.app',
    cleartext: true
  },
  android: {
    useLegacyBridge: true
  }
};

export default config;
