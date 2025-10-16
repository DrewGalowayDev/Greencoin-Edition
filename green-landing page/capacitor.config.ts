import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greenearth.nexus',
  appName: 'GreenCoin Nexus',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allow cleartext traffic for development
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'key0',
    },
    backgroundColor: '#1a1a1a',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
    },
  },
}

export default config;
