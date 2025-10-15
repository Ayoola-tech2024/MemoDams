
"use client";

import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface AppUser {
  id: string;
  name: string;
  email: string;
  createdAt: { seconds: number; nanoseconds: number };
  profilePictureUrl?: string;
  isEmailVerified: boolean;
  claims?: { [key: string]: any };
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
            <TableCell className="hidden lg:table-cell">
                <Skeleton className="h-6 w-20 rounded-full" />
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-8 w-8" />
            </TableCell>
        </TableRow>
    )
}

export default function AdminPage() {
  const { user: currentUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!currentUser) {
        router.replace("/dashboard");
        return;
    }
    
    setIsCheckingAdmin(true);
    currentUser.getIdTokenResult(true)
        .then(idTokenResult => {
            const claims = idTokenResult.claims;
            if (claims.admin === true || currentUser.email === 'damisileayoola@gmail.com') {
                setIsAdmin(true);
            } else {
                router.replace("/dashboard");
            }
            setIsCheckingAdmin(false);
        })
        .catch(() => {
             router.replace("/dashboard");
             setIsCheckingAdmin(false);
        });

  }, [currentUser, isUserLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, "users"), orderBy("createdAt", "desc"));
  }, [firestore, isAdmin]);

  const { data: users, isLoading } = useCollection<AppUser>(usersQuery);

  const handleMakeAdmin = (userId: string) => {
    toast({
      title: "Backend Function Required",
      description: "To make a user an admin, you need to set a custom claim. This requires a secure backend function (like a Firebase Cloud Function) that uses the Firebase Admin SDK. This UI is ready, but the backend logic needs to be deployed.",
      duration: 10000,
    });
  };

  if (isUserLoading || isCheckingAdmin || !isAdmin) {
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
                <TableHead className="hidden lg:table-cell">Role</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Date Joined
                </TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isLoading || isCheckingAdmin) && Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)}

              {!isLoading && !isCheckingAdmin && users?.map((user) => (
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
                  <TableCell className="hidden lg:table-cell">
                    {user.claims?.admin ? (
                      <Badge variant="default" className="gap-1 pl-2">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                     {user.createdAt
                      ? format(new Date(user.createdAt.seconds * 1000), "PPp")
                      : "No date"}
                  </TableCell>
                  <TableCell>
                    {!user.claims?.admin && user.email !== 'damisileayoola@gmail.com' && (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleMakeAdmin(user.id)}>
                                Make Admin
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
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
