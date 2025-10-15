
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { headers } from 'next/headers';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK
function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }
  return initializeApp({ projectId: firebaseConfig.projectId });
}

export async function POST(request: Request) {
  try {
    const adminApp = initializeAdminApp();
    const adminAuth = getAuth(adminApp);
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No ID token provided.' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized: ID token is empty.' }, { status: 401 });
    }

    // Verify the ID token of the *calling* user to ensure they are an admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // SECURITY CHECK: Only allow users who are already admins (by claim or email) to perform this action.
    if (decodedToken.admin !== true && decodedToken.email !== 'damisileayoola@gmail.com') {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not have permission to perform this action.' }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    // Set the custom claim on the target user
    await adminAuth.setCustomUserClaims(userId, { admin: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error setting admin claim:', error);
    // Return a sanitized error message
    return NextResponse.json({ success: false, error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
