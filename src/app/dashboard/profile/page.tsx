
"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore";
import Link from "next/link";
import { Settings, Calendar, LogIn } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";


export default function ProfilePage() {
  const { user, isUserLoading } = useUser()
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc(userProfileRef);

  const isLoading = isUserLoading || isLoadingProfile;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
         <Button asChild variant="outline">
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile & Settings
          </Link>
        </Button>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              This is your public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                 {isLoading ? <Skeleton className="h-20 w-20 rounded-full" /> : (
                    <>
                        <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/80/80`} />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </>
                 )}
              </Avatar>
              <div className="grid gap-1">
                 {isLoading ? (
                    <>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </>
                 ) : (
                    <>
                        <h2 className="text-xl font-semibold">{user?.displayName}</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </>
                 )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">About</h3>
              {isLoading ? (
                <div className="mt-2 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
              ) : (
                <p className="mt-2 text-foreground leading-relaxed">
                  {userProfile?.bio || "You haven't added a bio yet."}
                </p>
              )}
            </div>
            
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                    Your account-related information.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
                <div className="flex items-center">
                    <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div className="grid gap-0.5">
                        <p className="font-medium">Date Created</p>
                        {isLoading || !user?.metadata.creationTime ? <Skeleton className="h-4 w-48" /> : (
                           <p className="text-muted-foreground">{format(new Date(user.metadata.creationTime), "PPpp")}</p>
                        )}
                    </div>
                </div>
                 <div className="flex items-center">
                    <LogIn className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div className="grid gap-0.5">
                        <p className="font-medium">Last Login</p>
                         {isLoading || !user?.metadata.lastSignInTime ? <Skeleton className="h-4 w-48" /> : (
                           <p className="text-muted-foreground">{format(new Date(user.metadata.lastSignInTime), "PPpp")}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  )
}
