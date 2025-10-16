
'use server';

import { initializeAdmin } from '@/firebase/admin';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

/**
 * Creates a public, shareable version of a note.
 * This is a server action and should only be called from the server.
 * @param userId - The ID of the user who owns the note.
 * @param noteId - The ID of the note to share.
 */
export async function shareNoteAction(userId: string, noteId: string): Promise<{ success: boolean; url?: string; message: string; }> {
  try {
    const adminApp = initializeAdmin();
    const adminFirestore = adminApp.firestore();

    if (!userId || !noteId) {
      throw new Error('User ID and Note ID are required.');
    }
    
    // 1. Get the original note
    const noteDocRef = adminFirestore.collection('users').doc(userId).collection('notes').doc(noteId);
    const noteDoc = await noteDocRef.get();

    if (!noteDoc.exists) {
        return { success: false, message: 'Note not found.' };
    }
    const noteData = noteDoc.data();
    if (!noteData) {
        return { success: false, message: 'Note data is empty.' };
    }

    // 2. Check if it's already shared
    let sharedNoteId = noteData.sharedId;
    if (!sharedNoteId) {
       // 3. If not, create a new shared note document
       const newSharedNoteRef = adminFirestore.collection('sharedNotes').doc();
       await newSharedNoteRef.set({
            originalNoteId: noteId,
            originalUserId: userId,
            title: noteData.title,
            content: noteData.content,
            createdAt: noteData.createdAt,
            updatedAt: noteData.updatedAt,
            authorName: noteData.authorName || 'Anonymous',
       });
       sharedNoteId = newSharedNoteRef.id;

       // 4. Update the original note with the shared ID
       await noteDocRef.update({ sharedId: sharedNoteId });
    }

    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const shareUrl = `${protocol}://${host}/share/note/${sharedNoteId}`;

    // Revalidate path to update UI if needed (e.g., show a "shared" badge)
    revalidatePath(`/dashboard/notes/${noteId}`);

    return { success: true, url: shareUrl, message: 'Note is now public.' };

  } catch (error: any) {
    console.error('Error sharing note:', error);
    return { success: false, message: error.message || 'Failed to share note.' };
  }
}

/**
 * Makes a shared note private again.
 */
export async function unshareNoteAction(userId: string, noteId: string): Promise<{ success: boolean; message: string; }> {
    try {
        const adminApp = initializeAdmin();
        const adminFirestore = adminApp.firestore();
        
        if (!userId || !noteId) {
            throw new Error('User ID and Note ID are required.');
        }

        const noteDocRef = adminFirestore.collection('users').doc(userId).collection('notes').doc(noteId);
        const noteDoc = await noteDocRef.get();

        if (!noteDoc.exists) {
            return { success: false, message: 'Note not found.' };
        }

        const sharedId = noteDoc.data()?.sharedId;

        if (sharedId) {
            // Delete the public copy
            await adminFirestore.collection('sharedNotes').doc(sharedId).delete();
            // Remove the sharedId from the original note
            await noteDocRef.update({ sharedId: admin.firestore.FieldValue.delete() });
        }
        
        revalidatePath(`/dashboard/notes/${noteId}`);

        return { success: true, message: 'Note is now private.' };

    } catch (error: any)
    {
        console.error('Error unsharing note:', error);
        return { success: false, message: error.message || 'Failed to make note private.' };
    }
}
