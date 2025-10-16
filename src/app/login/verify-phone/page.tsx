
"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/firebase';
import { getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, MultiFactorResolver, MultiFactorError } from 'firebase/auth';
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
import Link from 'next/link';

const verifyMfaSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits."),
});

function VerifyPhoneComponent() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const mfaResolver = useMemo(() => {
    if (typeof window !== 'undefined') {
      const resolverJson = sessionStorage.getItem('mfaResolver');
      return resolverJson ? JSON.parse(resolverJson) as MultiFactorResolver : null;
    }
    return null;
  }, []);

  const form = useForm<z.infer<typeof verifyMfaSchema>>({
    resolver: zodResolver(verifyMfaSchema),
  });

  useEffect(() => {
    if (!mfaResolver) {
      toast({ variant: 'destructive', title: 'Invalid session. Please log in again.' });
      router.replace('/login');
      return;
    }

    const phoneInfo = mfaResolver.hints[0];
    const phoneAuthProvider = new PhoneAuthProvider(auth);

    phoneAuthProvider.verifyPhoneNumber(phoneInfo, window.recaptchaVerifier)
      .then(newVerificationId => {
        setVerificationId(newVerificationId);
        toast({ title: 'Verification code sent', description: `A code has been sent to ${phoneInfo.phoneNumber}.` });
      })
      .catch(error => {
        console.error("SMS verification sending failed:", error);
        toast({ variant: 'destructive', title: 'Could not send verification code' });
        router.replace('/login');
      });
  }, [mfaResolver, auth, router, toast]);

  const onSubmit = async (values: z.infer<typeof verifyMfaSchema>) => {
    if (!verificationId || !mfaResolver) return;

    setIsSubmitting(true);
    try {
      const resolver = getMultiFactorResolver(auth, mfaResolver as unknown as MultiFactorError);
      const phoneCredential = PhoneAuthProvider.credential(verificationId, values.code);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneCredential);
      
      const userCredential = await resolver.resolveSignIn(multiFactorAssertion);

      sessionStorage.removeItem('mfaResolver');

      toast({ title: "Login Successful", description: "Welcome back!" });
      router.replace('/dashboard');
    } catch (error) {
      console.error("MFA verification failed:", error);
      form.setError('code', { message: 'Invalid verification code. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mfaResolver) {
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
            <CardTitle className="text-2xl">Verify Your Device</CardTitle>
            <CardDescription>
              For your security, we've sent a 6-digit code to your registered phone number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123456" autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting || !verificationId}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? 'Verifying...' : 'Verify & Log In'}
                </Button>
              </form>
            </Form>
          </CardContent>
           <CardFooter className="text-center text-sm">
            <p className="w-full">
                Having trouble?{' '}
                <Link href="/login" className="underline" onClick={() => sessionStorage.clear()}>
                    Start over
                </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


export default function VerifyPhonePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyPhoneComponent />
            <div id="recaptcha-container"></div>
        </Suspense>
    )
}
