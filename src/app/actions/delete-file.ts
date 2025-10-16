'use server';

import { initializeAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import { getAuth } from 'firebase-admin/auth';

/**
 * Deletes a file from Firebase Storage and its corresponding document from Firestore.
 * This is a server action and should only be called from the server.
 * @param userId - The ID of the user who owns the file.
 * @param fileId - The ID of the file document in Firestore.
 * @param filePath - The full path to the file in Firebase Storage.
 */
export async function deleteFileAction(userId: string, fileId: string, filePath: string) {
  try {
    const adminApp = initializeAdmin();
    const adminAuth = getAuth(adminApp);
    const adminFirestore = adminApp.firestore();
    const adminStorage = adminApp.storage();

    if (!userId || !fileId || !filePath) {
      throw new Error('User ID, File ID, and File Path are required.');
    }
    
    // Delete Firestore document
    const fileDocRef = adminFirestore.collection('users').doc(userId).collection('files').doc(fileId);
    await fileDocRef.delete();

    // Delete file from Storage
    await adminStorage.bucket().file(filePath).delete();
    
    // Revalidate paths to update the UI
    revalidatePath('/dashboard/files');
    revalidatePath('/dashboard/photos');
    revalidatePath('/dashboard/videos');

    return { success: true, message: 'File deleted successfully.' };

  } catch (error: any) {
    console.error('Error deleting file:', error);
    return { success: false, message: error.message || 'Failed to delete file.' };
  }
}
