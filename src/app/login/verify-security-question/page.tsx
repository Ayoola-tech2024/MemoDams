
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
import { Skeleton } from '@/components/ui/skeleton';

const verifyQuestionSchema = z.object({
  answer: z.string().min(1, "An answer is required."),
});

export default function VerifySecurityQuestionPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [secretQuestion, setSecretQuestion] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<z.infer<typeof verifyQuestionSchema>>({
    resolver: zodResolver(verifyQuestionSchema),
    defaultValues: {
      answer: "",
    }
  });

  useEffect(() => {
    const pendingUid = sessionStorage.getItem('pending-verification-uid');
    
    if (user && pendingUid !== user.uid) {
        router.replace('/dashboard');
        return;
    }

    if (!isUserLoading && !user && !pendingUid) {
        router.replace('/login');
        return;
    }

    if (pendingUid && firestore) {
        const fetchSecurityData = async () => {
            setIsLoadingData(true);
            const userDocRef = doc(firestore, 'users', pendingUid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists() && userDocSnap.data().secretQuestion) {
                setSecretQuestion(userDocSnap.data().secretQuestion);
                setCorrectAnswer(userDocSnap.data().secretAnswer);
            } else {
                toast({ variant: 'destructive', title: 'Security check not required.' });
                await doLogout();
            }
            setIsLoadingData(false);
        };
        fetchSecurityData();
    }
  }, [user, isUserLoading, router, firestore, toast]);

  const onSubmit = async (values: z.infer<typeof verifyQuestionSchema>) => {
    // Note: In a real app, the answer should be hashed and compared on a server.
    // For this client-side simulation, we do a simple case-insensitive comparison.
    if (values.answer.trim().toLowerCase() === correctAnswer?.toLowerCase()) {
        toast({ title: "Verification Successful", description: "Welcome back!" });
        const pendingUid = sessionStorage.getItem('pending-verification-uid');
        if (pendingUid) {
            localStorage.setItem(`device-verified-${pendingUid}`, 'true');
        }
        sessionStorage.removeItem('pending-verification-uid');
        router.replace('/dashboard');
    } else {
        form.setError('answer', { message: 'Incorrect answer. Please try again.' });
    }
  };

  const doLogout = async () => {
      if (!auth) return;
      sessionStorage.clear();
      localStorage.clear(); // Clear device verification status as well
      await signOut(auth);
      router.replace('/login');
  }

  if (isUserLoading || isLoadingData) {
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
              To protect your account, please answer your security question.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{secretQuestion || <Skeleton className="h-5 w-3/4" />}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your answer" autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
