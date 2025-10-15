
"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser, useFirestore, useDoc, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useEffect, useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";


const profileSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  bio: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})


export default function ProfilePage() {
  const { user } = useUser()
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isPending, startTransition] = useTransition();


  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc(userProfileRef);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
        profileForm.reset({
            fullName: user?.displayName || "",
            bio: userProfile.bio || ""
        });
    } else if(user) {
         profileForm.reset({
            fullName: user.displayName || ""
        });
    }
  }, [userProfile, user, profileForm]);


  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  })

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user || !userProfileRef) return;
    
    // Non-blocking UI update
    updateProfile(user, { displayName: values.fullName }).catch(err => {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    });

    const profileData = { bio: values.bio };
    setDoc(userProfileRef, profileData, { merge: true })
      .then(() => {
          toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      })
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: userProfileRef.path,
          operation: 'update',
          requestResourceData: profileData
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    if (!user || !user.email) return;

    try {
        const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, values.newPassword);
        
        toast({ title: "Password Updated", description: "Your password has been changed successfully." });
        passwordForm.reset();
        setIsPasswordDialogOpen(false);
    } catch (error: any) {
        console.error("Password update failed", error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            passwordForm.setError("currentPassword", { type: "manual", message: "Incorrect current password."})
             toast({ variant: "destructive", title: "Password Update Failed", description: "The current password you entered is incorrect." });
        } else {
             toast({ variant: "destructive", title: "Password Update Failed", description: error.message });
        }
    }
  }

  async function handlePhotoUploadComplete(downloadURL: string) {
    if (!user || !userProfileRef) return;

    updateProfile(user, { photoURL: downloadURL }).catch(err => {
        toast({ variant: "destructive", title: "Photo Update Failed", description: err.message });
    });

    const photoData = { profilePictureUrl: downloadURL };
    setDoc(userProfileRef, photoData, { merge: true })
        .then(() => {
            toast({ title: "Profile Photo Updated", description: "Your new photo has been saved."});
            startTransition(() => {
                router.refresh();
            });
        })
        .catch(error => {
            const permissionError = new FirestorePermissionError({
                path: userProfileRef.path,
                operation: 'update',
                requestResourceData: photoData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }

  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );


  if (!user || isLoadingProfile) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details here. Click save when you're done.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/80/80`} />
                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                   <FileUploadDialog
                      fileTypes={["image/png", "image/jpeg", "image/gif"]}
                      onUploadComplete={handlePhotoUploadComplete}
                      trigger={<Button type="button">Change Photo</Button>}
                    />
                </div>
                 <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Full Name</FormLabel>
                       <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email || ""} readOnly />
                   <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed.</p>
                </div>
                 <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Short Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little about yourself"
                          {...field}
                        />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={profileForm.formState.isSubmitting || isPending}>
                    {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isPasswordProvider && (
            <Card>
            <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                    Update your password here. It's a good practice to use a strong, unique password.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <FormLabel>New Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input type={showNewPassword ? "text" : "password"} {...field} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute inset-y-0 right-0 h-full px-3"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <FormLabel>Confirm New Password</FormLabel>
                           <div className="relative">
                            <FormControl>
                              <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute inset-y-0 right-0 h-full px-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button type="button">Update Password</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Your Identity</AlertDialogTitle>
                        <AlertDialogDescription>
                            For your security, please enter your current password to make this change.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                            <FormItem className="grid gap-2 mt-4">
                                <FormLabel>Current Password</FormLabel>
                                <div className="relative">
                                <FormControl>
                                <Input type={showCurrentPassword ? "text" : "password"} {...field} autoFocus />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute inset-y-0 right-0 h-full px-3"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={passwordForm.handleSubmit(onPasswordSubmit)} disabled={passwordForm.formState.isSubmitting}>
                            {passwordForm.formState.isSubmitting ? "Updating..." : "Confirm and Update"}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
                </form>
            </Form>
            </Card>
        )}
      </div>
    </>
  )
}
