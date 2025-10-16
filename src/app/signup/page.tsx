

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth, useUser, useFirestore, FirestorePermissionError, errorEmitter } from "@/firebase"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, User } from "firebase/auth"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Phone } from "lucide-react"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.108-11.187-7.231l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.83,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  )
}

const formSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

const phoneSchema = z.object({
    phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
})

export default function SignupPage() {
  const router = useRouter()
  const auth = useAuth()
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false);
  const [isPhonePromptOpen, setIsPhonePromptOpen] = useState(false);
  const [newlySignedUpUser, setNewlySignedUpUser] = useState<User | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

   const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
        phoneNumber: "",
    },
  });


  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/dashboard")
    }
  }, [user, isUserLoading, router])

  const createUserDocument = async (user: User, additionalData = {}) => {
    if (!user || !firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userData = {
        name: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
        profilePictureUrl: user.photoURL || '',
        ...additionalData
    };
    try {
        await setDoc(userRef, userData, { merge: true });
        // For simulation purposes, let's also save to local storage
        localStorage.setItem(`user-profile-${user.uid}`, JSON.stringify(userData));
    } catch(error) {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
      await updateProfile(userCredential.user, { displayName: values.fullName });
      await createUserDocument(userCredential.user, { name: values.fullName });
      
      toast({ 
        title: "Account Created!", 
        description: "Welcome! Let's get your account set up." 
      });
      
      setNewlySignedUpUser(userCredential.user);
      setIsPhonePromptOpen(true);

    } catch (error: any) {
      console.error("Signup failed:", error)
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred.",
      })
    }
  }

  async function handleGoogleSignIn() {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await createUserDocument(result.user);
      
      toast({ title: "Account Created", description: "Welcome to MemoDams!" });

      setNewlySignedUpUser(result.user);
      setIsPhonePromptOpen(true);
    } catch (error: any) {
      console.error("Google sign-in failed:", error)
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message || "Could not sign in with Google.",
      })
    }
  }

  const handleSkipPhone = () => {
    setIsPhonePromptOpen(false);
    router.push("/dashboard");
  }

  const handlePhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    if (!newlySignedUpUser || !firestore) return;

    const userRef = doc(firestore, 'users', newlySignedUpUser.uid);
    try {
        await setDoc(userRef, { phoneNumber: values.phoneNumber }, { merge: true });
        // For simulation
        const profile = JSON.parse(localStorage.getItem(`user-profile-${newlySignedUpUser.uid}`) || '{}');
        profile.phoneNumber = values.phoneNumber;
        localStorage.setItem(`user-profile-${newlySignedUpUser.uid}`, JSON.stringify(profile));

        toast({
            title: "Phone Number Added",
            description: "Your phone number has been saved for account security."
        });
        handleSkipPhone();
    } catch(error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your phone number.",
        });
    }
  }


  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center">
            <Logo />
            </div>
            <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>
                Enter your information to create an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem className="grid gap-2">
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="grid gap-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="grid gap-2">
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                            <FormControl>
                            <Input type={showPassword ? "text" : "password"} {...field} />
                            </FormControl>
                            <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creating account..." : "Create an account"}
                    </Button>
                    <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
                    <GoogleIcon />
                    <span className="ml-2">Sign up with Google</span>
                    </Button>
                </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                    Login
                </Link>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>

        <Dialog open={isPhonePromptOpen} onOpenChange={(open) => { if(!open) handleSkipPhone()}}>
            <DialogContent className="sm:max-w-md">
                 <Form {...phoneForm}>
                    <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                One More Step (Optional)
                            </DialogTitle>
                            <DialogDescription>
                                Add a phone number for enhanced account security. You'll be asked for this number when logging in on new devices.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <FormField
                                control={phoneForm.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem className="grid gap-2">
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 555 123 4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="sm:justify-between">
                             <Button type="button" variant="ghost" onClick={handleSkipPhone}>
                                Skip for Now
                            </Button>
                            <Button type="submit" disabled={phoneForm.formState.isSubmitting}>
                                {phoneForm.formState.isSubmitting ? "Saving..." : "Save Phone Number"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </>
  )
}
