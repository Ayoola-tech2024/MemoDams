

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';

const verifyPhoneSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required."),
});

export default function VerifyPhoneNumberPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedPhoneNumber, setStoredPhoneNumber] = useState<string | null>(null);

  const form = useForm<z.infer<typeof verifyPhoneSchema>>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      phoneNumber: "",
    }
  });

  useEffect(() => {
    const pendingUid = sessionStorage.getItem('pending-verification-uid');
    
    // If there's a logged-in user and they don't need verification, go to dashboard
    if (user && pendingUid !== user.uid) {
        router.replace('/dashboard');
        return;
    }

    // If no user is logged in and no pending UID, go to login
    if (!isUserLoading && !user && !pendingUid) {
        router.replace('/login');
        return;
    }

    // Fetch the required phone number
    if (pendingUid && firestore) {
        const fetchPhoneNumber = async () => {
            // In a real app, you would fetch this securely.
            // For simulation, we'll use local storage which was set during sign-up.
            const profile = JSON.parse(localStorage.getItem(`user-profile-${pendingUid}`) || '{}');
            if (profile.phoneNumber) {
                setStoredPhoneNumber(profile.phoneNumber);
            } else {
                // This user shouldn't be on this page
                toast({ variant: 'destructive', title: 'Security check not required.' });
                await doLogout();
            }
        };
        fetchPhoneNumber();
    }
  }, [user, isUserLoading, router, firestore, toast]);

  const onSubmit = async (values: z.infer<typeof verifyPhoneSchema>) => {
    setIsSubmitting(true);
    // Simple string comparison
    if (values.phoneNumber === storedPhoneNumber) {
        toast({ title: "Verification Successful", description: "Welcome back!" });
        sessionStorage.removeItem('pending-verification-uid');
        router.replace('/dashboard');
    } else {
        form.setError('phoneNumber', { message: 'Incorrect phone number. Please try again.' });
        setIsSubmitting(false);
    }
  };

  const doLogout = async () => {
      sessionStorage.clear();
      await signOut(auth);
      router.replace('/login');
  }

  if (isUserLoading || !storedPhoneNumber) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
            <CardDescription>
              As a security measure, please enter the phone number associated with this account to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registered Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 555 123 4567" autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </form>
            </Form>
          </CardContent>
           <CardFooter className="text-center text-sm">
            <p className="w-full">
                Not your account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={doLogout}>
                    Log out
                </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
