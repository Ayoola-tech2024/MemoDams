
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setAdminClaim } from "@/app/actions/set-admin-claim";
import { useToast } from "@/hooks/use-toast";
import { getIdTokenResult } from "firebase/auth";

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  createdAt: { seconds: number; nanoseconds: number };
  profilePictureUrl?: string;
  customClaims?: {
    admin?: boolean;
  };
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/dashboard');
      return;
    }

    setIsCheckingAdmin(true);
    // Force a token refresh to get the latest claims.
    getIdTokenResult(user, true).then((idTokenResult) => {
      const claims = idTokenResult.claims;
      // Check for custom admin claim OR the fallback email address.
      const isAdminUser = claims.admin === true || user.email === 'damisileayoola@gmail.com';
      setIsAdmin(isAdminUser);
      setIsCheckingAdmin(false);

      if (!isAdminUser) {
        router.push('/dashboard');
      }
    });

  }, [user, isUserLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null;
    return query(collection(firestore, 'users'), orderBy("createdAt", "desc"));
  }, [isAdmin, firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<RegisteredUser>(usersQuery);

  const handleMakeAdmin = async (targetUserId: string) => {
    try {
      const result = await setAdminClaim({ userId: targetUserId });
      if (result.success) {
        toast({
          title: "Success",
          description: "User has been made an admin. They may need to log out and log back in to see changes.",
        });
        // Note: The UI won't update instantly because claims are on the token.
        // A full refresh or re-login by the target user is required.
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to make admin",
        description: error.message,
      });
    }
  };

  if (isUserLoading || isCheckingAdmin) {
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
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Date Joined</TableHead>
                <TableHead>Actions</TableHead>
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
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
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
                  <TableCell>
                    {registeredUser.customClaims?.admin || registeredUser.email === 'damisileayoola@gmail.com' ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {registeredUser.createdAt ? format(new Date(registeredUser.createdAt.seconds * 1000), "PPp") : 'No date'}
                  </TableCell>
                  <TableCell>
                    {(!registeredUser.customClaims?.admin && registeredUser.email !== 'damisileayoola@gmail.com') && (
                       <Button size="sm" variant="outline" onClick={() => handleMakeAdmin(registeredUser.id)}>
                        Make Admin
                      </Button>
                    )}
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

    