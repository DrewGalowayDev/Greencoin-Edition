import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export const initializeCapacitor = async () => {
  // Hide the splash screen with a fade out
  await SplashScreen.hide({
    fadeOutDuration: 500
  });

  // Set status bar style
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#ffffff' });

  // Handle back button
  App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp();
    } else {
      window.history.back();
    }
  });

  // Handle app state changes
  App.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Is active?', isActive);
  });

  // Handle deep links
  App.addListener('appUrlOpen', (data) => {
    console.log('App opened with URL:', data.url);
  });
};

export const setupDeepLinks = () => {
  App.addListener('appUrlOpen', (data) => {
    const slug = data.url.split('.app').pop();
    if (slug) {
      window.location.href = slug;
    }
  });
};