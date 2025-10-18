
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop, Trash2, Mail, MessageSquare, Eye, EyeOff, CalendarIcon, ShieldQuestion } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, useTransition } from "react";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { SecurityQuestionDialog } from "./security-question-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


const profileSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  bio: z.string().optional(),
  birthday: z.date().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useUser()
  const auth = useAuth()
  const firestore = useFirestore();
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
    defaultValues: { fullName: "", bio: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (userProfile) {
        profileForm.reset({
            fullName: user?.displayName || "",
            bio: userProfile.bio || "",
            birthday: userProfile.birthday ? new Date(userProfile.birthday) : undefined,
        });
    } else if(user) {
         profileForm.reset({
            fullName: user.displayName || "",
            bio: ""
        });
    }
  }, [userProfile, user, profileForm]);

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user || !userProfileRef) return;

    try {
        await updateProfile(user, { displayName: values.fullName });
        
        const profileData: any = { 
            bio: values.bio, 
            name: values.fullName 
        };
        
        // Only allow setting birthday if it doesn't exist
        if (values.birthday && !userProfile?.birthday) {
            profileData.birthday = values.birthday.toISOString().split('T')[0]; // Store as YYYY-MM-DD
        }

        await setDoc(userProfileRef, profileData, { merge: true });

        toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
        
    } catch (error: any) {
        console.error("Profile update failed", error);
        toast({ variant: "destructive", title: "Profile Update Failed", description: error.message });
    }
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
        } else {
             toast({ variant: "destructive", title: "Password Update Failed", description: error.message });
        }
    }
  }

  async function handlePhotoUploadComplete(downloadURL: string) {
    if (!user || !userProfileRef) return;

    try {
        await updateProfile(user, { photoURL: downloadURL });
        const photoData = { profilePictureUrl: downloadURL };
        await setDoc(userProfileRef, photoData, { merge: true });

        toast({ title: "Profile Photo Updated", description: "Your new photo has been saved."});
        startTransition(() => router.refresh());
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update Failed", description: "Could not update profile photo."});
    }
  }
  
  const emailSubject = "Issue report from MemoDams";
  const whatsAppText = "Hello, I have a question about MemoDams.";
  const isPasswordProvider = user?.providerData.some((provider) => provider.providerId === "password");

  if (!user || isLoadingProfile) return <div>Loading...</div>

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
      </div>
      <div className="grid gap-6 mt-4">
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
                    <AvatarImage src={user.photoURL || undefined} />
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
                  <div className="flex items-center justify-between">
                     <Label htmlFor="email">Email</Label>
                  </div>
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
                          className="min-h-[100px]"
                          placeholder="Tell us a little about yourself"
                          {...field}
                        />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>Birthday</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={!!userProfile?.birthday}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-nav"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01") || !!userProfile?.birthday
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground mt-1">
                        {userProfile?.birthday ? "Your birthday cannot be changed." : "You can only set your birthday once."}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                    Manage your account's security settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                 {isPasswordProvider && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <Label className="font-semibold">Change Password</Label>
                            <p className="text-xs text-muted-foreground">It's a good practice to use a strong, unique password.</p>
                        </div>
                        <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="outline" className="shrink-0 mt-2 sm:mt-0">Update Password</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <Form {...passwordForm}>
                                <form>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Change Password</AlertDialogTitle>
                                </AlertDialogHeader>
                                <div className="grid gap-4 py-4">
                                     <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                        <FormItem className="grid gap-2">
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
                                </div>

                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={passwordForm.handleSubmit(onPasswordSubmit)} disabled={passwordForm.formState.isSubmitting}>
                                    {passwordForm.formState.isSubmitting ? "Updating..." : "Confirm and Update"}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                                </form>
                                </Form>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Label className="font-semibold">Security Question</Label>
                        <p className="text-xs text-muted-foreground">
                             {userProfile?.secretQuestion ? `Question set: "${userProfile.secretQuestion}"` : "Add an extra layer of security for new devices."}
                        </p>
                    </div>
                     <SecurityQuestionDialog 
                        user={user} 
                        userProfile={userProfile}
                        trigger={
                            <Button variant="outline" className="shrink-0 mt-2 sm:mt-0">
                                <ShieldQuestion className="mr-2 h-4 w-4" />
                                {userProfile?.secretQuestion ? "Change Question" : "Set Question"}
                            </Button>
                        }
                    />
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Theme Preferences</CardTitle>
            <CardDescription>
              Choose how you want to experience MemoDams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <Label htmlFor="theme-light" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                <Sun className="mb-3 h-6 w-6" />
                Light
              </Label>
              <Label htmlFor="theme-dark" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                <Moon className="mb-3 h-6 w-6" />
                Dark
              </Label>
              <Label htmlFor="theme-system" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                <Laptop className="mb-3 h-6 w-6" />
                System
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support & Feedback</CardTitle>
            <CardDescription>
              Encountered a problem or have a suggestion? Let us know.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2">
                <Button asChild variant="outline">
                <a href={`mailto:damisileayoola@gmail.com?subject=${encodeURIComponent(emailSubject)}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Report an Issue
                </a>
                </Button>
                <Button asChild variant="outline">
                <a href={`https://wa.me/2348169787869?text=${encodeURIComponent(whatsAppText)}`} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Developer
                </a>
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              These actions are permanent and cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove all your data, including notes, files, and personal settings.
            </p>
          </CardContent>
          <CardFooter className="border-t border-destructive/50 px-6 py-4">
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="destructive" disabled>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete My Account
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This feature is not yet implemented.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
