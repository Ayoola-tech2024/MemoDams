
'use server';

import { getAuth } from 'firebase-admin/auth';
import { headers } from 'next/headers';
import { initializeAdmin } from '@/firebase/admin';

// Initialize Firebase Admin SDK
const adminApp = initializeAdmin();
const adminAuth = getAuth(adminApp);

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function setAdminClaim({ uid }: { uid: string }): Promise<ActionResult> {
  try {
    const headersList = headers();
    const idToken = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
      throw new Error('No authorization token provided.');
    }

    // Verify the ID token of the user making the request
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const callerUid = decodedToken.uid;
    const callerClaims = decodedToken;
    
    // Security Check: Only an existing admin can make another user an admin.
    // Also include a bootstrap condition for the first admin.
    const isCallerAdmin = callerClaims.admin === true || callerClaims.email === 'damisileayoola@gmail.com';
    if (!isCallerAdmin) {
      throw new Error('Permission denied. You must be an admin to perform this action.');
    }
    
    // Set the custom claim on the target user
    await adminAuth.setCustomUserClaims(uid, { admin: true });

    return { success: true };
  } catch (error: any) {
    console.error('Error setting custom claim:', error);
    return { success: false, error: error.message || 'An internal error occurred.' };
  }
}
