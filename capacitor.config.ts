import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.streetsmart.safety',
  appName: 'Street Smart',
  webDir: 'dist/client',        // ← This must be 'dist/client'
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;