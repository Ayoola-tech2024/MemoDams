"use server";

import { initializeAdmin } from '@/firebase/admin';
import { Auth, UserRecord } from 'firebase-admin/auth';

/**
 * Lists all users from Firebase Authentication.
 * This is a server action and should only be called from a server component
 * within the admin console.
 */
export async function listAllUsers(): Promise<{ users: UserRecord[]; error: string | null; }> {
  try {
    const adminApp = initializeAdmin();
    const adminAuth: Auth = adminApp.auth();

    const userRecords = await adminAuth.listUsers();
    
    // We are returning a plain object to avoid issues with serializing class instances
    const users = userRecords.users.map(user => user.toJSON() as UserRecord);

    return { users, error: null };
  } catch (error: any) {
    console.error("Error listing users:", error);
    // In a real app, you might want to check for specific error codes
    // to provide more granular error messages.
    return { users: [], error: "Failed to fetch users. You may not have permission." };
  }
}
