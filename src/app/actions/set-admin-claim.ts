
'use server';

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, App, applicationDefault } from 'firebase-admin/app';
import { headers } from 'next/headers';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK
function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }
  
  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS 
    ? applicationDefault()
    : undefined;

  return initializeApp({
    projectId: firebaseConfig.projectId,
    credential,
  });
}

export async function setAdminClaim(data: { userId: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const adminApp = initializeAdminApp();
    const adminAuth = getAuth(adminApp);
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
        throw new Error('Unauthorized: No ID token provided.');
    }

    const idToken = authorization.split('Bearer ')[1];
    
    if (!idToken) {
         throw new Error('Unauthorized: ID token is empty.');
    }

    // Verify the ID token of the *calling* user to ensure they are an admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // SECURITY CHECK: Only allow users who are already admins (by claim or email) to perform this action.
    const isAuthorized = decodedToken.admin === true || decodedToken.email === 'damisileayoola@gmail.com';
    if (!isAuthorized) {
      throw new Error('Forbidden: You do not have permission to perform this action.');
    }

    // Set the custom claim on the target user
    await adminAuth.setCustomUserClaims(data.userId, { admin: true });

    return { success: true };
  } catch (error: any) {
    console.error('Error setting admin claim:', error);
    // Return a sanitized error message
    return { success: false, error: error.message || 'An internal server error occurred.' };
  }
}
