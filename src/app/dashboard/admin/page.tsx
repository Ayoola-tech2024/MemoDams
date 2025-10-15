
"use client";

import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { setAdminClaim } from "@/app/actions/set-admin-claim";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: { seconds: number; nanoseconds: number };
  profilePictureUrl?: string;
  isAdmin?: boolean;
}

export default function AdminPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [updatingAdmins, setUpdatingAdmins] = useState<string[]>([]);


  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const handleMakeAdmin = async (targetUserId: string, targetUserEmail: string) => {
    setUpdatingAdmins(prev => [...prev, targetUserId]);
    try {
      const result = await setAdminClaim({ uid: targetUserId });
      if (result.success) {
        toast({
          title: "Admin Status Updated",
          description: `${targetUserEmail} is now an admin.`,
        });
        // Note: The custom claim will be reflected on the user's next sign-in or token refresh.
        // We could optionally force a refresh on the client side for the user being made an admin,
        // but for this dashboard, a page reload or next login will suffice.
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Update Admin Status",
        description: error.message,
      });
    } finally {
      setUpdatingAdmins(prev => prev.filter(id => id !== targetUserId));
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <div>
              <CardTitle>Admin Console</CardTitle>
              <CardDescription>Manage users and their roles.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Date Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={u.profilePictureUrl} />
                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{u.email}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {u.createdAt ? format(new Date(u.createdAt.seconds * 1000), "PP") : "N/A"}
                  </TableCell>
                  <TableCell>
                    {u.isAdmin || u.email === 'damisileayoola@gmail.com' ? (
                      <Badge variant="destructive">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id !== user?.uid && !u.isAdmin && u.email !== 'damisileayoola@gmail.com' && (
                       <Button
                          size="sm"
                          onClick={() => handleMakeAdmin(u.id, u.email)}
                          disabled={updatingAdmins.includes(u.id)}
                        >
                          {updatingAdmins.includes(u.id) ? "Updating..." : "Make Admin"}
                        </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
