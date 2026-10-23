
import * as admin from 'firebase-admin';

// This is a server-side only file.

let adminApp: admin.app.App | undefined;

/**
 * Initializes and returns the Firebase Admin App instance.
 * It uses a singleton pattern to ensure it's initialized only once.
 */
export function initializeAdmin(): admin.app.App {
  // If the app is already initialized, return it.
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0]!;
  }

  try {
    // In a deployed Firebase environment (like App Hosting or Cloud Functions),
    // initializing without arguments will use the application's default credentials.
    adminApp = admin.initializeApp();
    return adminApp;
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    if (admin.apps.length > 0 && admin.apps[0]) {
      return admin.apps[0]!;
    }
    // If initialization fails, throw an error to prevent the app from running with a misconfiguration.
    throw new Error('Failed to initialize Firebase Admin SDK. The environment may not be set up correctly.');
  }
}
