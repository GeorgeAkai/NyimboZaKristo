import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'sda.nyimbozakristo.app',
  appName: 'Nyimbo Za Kristo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
};

export default config;
