
"use client";

import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface AppUser {
  id: string;
  name: string;
  email: string;
  createdAt: { seconds: number; nanoseconds: number };
  profilePictureUrl?: string;
  isEmailVerified: boolean;
}

function UserRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="grid gap-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-4 w-28" />
            </TableCell>
        </TableRow>
    )
}

export default function AdminPage() {
  const { user: currentUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && currentUser?.email !== "damisileayoola@gmail.com") {
      router.replace("/dashboard");
    }
  }, [currentUser, isUserLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<AppUser>(usersQuery);

  if (isUserLoading || currentUser?.email !== "damisileayoola@gmail.com") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Loading or unauthorized...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Admin - All Users</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            A list of all users who have signed up for MemoDams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Date Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)}

              {!isLoading && users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.profilePictureUrl || `https://picsum.photos/seed/${user.id}/40/40`} />
                        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={user.isEmailVerified ? "secondary" : "outline"}>
                      {user.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                     {user.createdAt
                      ? format(new Date(user.createdAt.seconds * 1000), "PPp")
                      : "No date"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       {!isLoading && (!users || users.length === 0) && (
         <div className="text-center text-muted-foreground py-10">No users found.</div>
      )}
    </>
  );
}
