
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { getMultiFactorResolver, TotpMultiFactorGenerator, MultiFactorResolver, MultiFactorError, MultiFactorInfo } from 'firebase/auth';
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

export default function VerifyMfaPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use memoization to avoid re-parsing on every render
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
    // If the resolver is missing, the user probably landed here by mistake.
    if (!mfaResolver) {
      toast({ variant: 'destructive', title: 'Invalid session. Please log in again.' });
      router.replace('/login');
    }
  }, [mfaResolver, router, toast]);

  const onSubmit = async (values: z.infer<typeof verifyMfaSchema>) => {
    setIsSubmitting(true);
    try {
      const resolver = getMultiFactorResolver(auth, mfaResolver as unknown as MultiFactorError);
      const totpAssertion = TotpMultiFactorGenerator.assertionForSignIn(
        resolver.hints[0].uid,
        values.code
      );
      const userCredential = await resolver.resolveSignIn(totpAssertion);

      // Clean up session storage
      sessionStorage.removeItem('mfaResolver');
      sessionStorage.removeItem('mfaHint');

      toast({ title: "Login Successful", description: "Welcome back!" });
      router.replace('/dashboard');
    } catch (error: any) {
      form.setError('code', { message: 'Invalid verification code. Please try again.' });
      console.error("MFA verification failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mfaResolver) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Loading...</p>
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
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app.
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
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </form>
            </Form>
          </CardContent>
           <CardFooter className="text-center text-sm">
            <p className="w-full">
                Can't access your authenticator?{' '}
                <Link href="/login" className="underline" onClick={() => sessionStorage.clear()}>
                    Log in another way
                </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    