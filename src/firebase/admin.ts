
import * as admin from 'firebase-admin';

// This is a server-side only file.

// Ensure the environment variables are set in your deployment environment.
// For local development, you can use a .env.local file.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

let adminApp: admin.App;

export function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const credential = admin.credential.cert(serviceAccount as admin.ServiceAccount);
    adminApp = admin.initializeApp({ credential });
    return adminApp;
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // If initialization fails, throw an error to prevent the app from running with a misconfiguration.
    throw new Error('Failed to initialize Firebase Admin SDK. Please check your service account credentials.');
  }
}
