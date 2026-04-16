/**
 * registerServiceWorker.ts - Service Worker registration utilities
 *
 * Provides functions to register and unregister the PWA service worker.
 * Only runs on web platform; no-ops on native iOS/Android. Automatically
 * checks for service worker updates every hour.
 */

import { Platform } from 'react-native';

export function registerServiceWorker(): void {
  if (Platform.OS !== 'web') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('ServiceWorker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          console.log('ServiceWorker registration failed:', error);
        });
    });
  }
}

export function unregisterServiceWorker(): void {
  if (Platform.OS !== 'web') return;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('ServiceWorker unregister failed:', error);
      });
  }
}
