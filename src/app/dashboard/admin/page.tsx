
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  createdAt: { seconds: number; nanoseconds: number };
  profilePictureUrl?: string;
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const isAdmin = user?.email === 'damisileayoola@gmail.com';

  useEffect(() => {
    // If user is loaded and is not the admin, redirect them.
    if (!isUserLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, isAdmin, router]);

  const usersQuery = useMemoFirebase(() => {
    // Only construct the query if the user is an admin.
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'users'), orderBy("createdAt", "desc"));
  }, [isAdmin, firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<RegisteredUser>(usersQuery);

  // Show a loading state while we verify admin status
  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Verifying access...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Admin Console</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>A list of all users who have created an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers && (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                  </TableRow>
                ))
              )}

              {!isLoadingUsers && users && users.map((registeredUser) => (
                <TableRow key={registeredUser.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={registeredUser.profilePictureUrl} />
                        <AvatarFallback>{registeredUser.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{registeredUser.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{registeredUser.email}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {registeredUser.createdAt ? format(new Date(registeredUser.createdAt.seconds * 1000), "PPp") : 'No date'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!isLoadingUsers && (!users || users.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              No users have signed up yet.
            </div>
          )}

        </CardContent>
      </Card>
    </>
  );
}
