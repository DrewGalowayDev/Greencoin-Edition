import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

// Constants for detecting platform
export const isMobile = Capacitor.getPlatform() !== 'web';
export const isAndroid = Capacitor.getPlatform() === 'android';

// Handle safe area insets
export const setupSafeArea = () => {
  if (isAndroid) {
    document.documentElement.style.setProperty(
      '--safe-area-top',
      '24px' // Default status bar height for Android
    );
  }
};

// Handle file paths for mobile
export const getAssetPath = (path: string) => {
  if (isMobile) {
    // Convert relative paths to absolute for mobile
    return `${window.location.origin}/${path}`;
  }
  return path;
};

// Handle network connectivity
export const setupNetworkHandling = () => {
  window.addEventListener('online', () => {
    console.log('Network connection restored');
    // Add your network restore logic here
  });

  window.addEventListener('offline', () => {
    console.log('Network connection lost');
    // Add your offline handling logic here
  });
};

// CORS configuration for mobile
export const getFetchOptions = () => {
  return {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    // Add any additional CORS or mobile-specific headers here
  };
};

// Initialize all mobile features
export const initializeMobileFeatures = async () => {
  if (isMobile) {
    await setupSafeArea();
    setupNetworkHandling();
  }
};