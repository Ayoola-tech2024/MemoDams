
"use client";

import { useUser, useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { sendEmailVerification, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { MailCheck, LogOut, RefreshCw, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // If user is loaded and verified, redirect to dashboard
        if (!isUserLoading && user?.emailVerified) {
            router.push('/dashboard');
        }
        // If user is loaded and not logged in, redirect to login
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleResendVerification = async () => {
        if (!user) return;
        setIsSending(true);
        try {
            await sendEmailVerification(user);
            toast({
                title: "Verification Email Sent",
                description: "A new verification link has been sent to your email address.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to Send Email",
                description: error.message || "An unexpected error occurred.",
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleCheckVerification = async () => {
        if (!user) return;
        setIsChecking(true);
        try {
            await user.reload();
            // Re-check the verification status after reloading
            if (user.emailVerified) {
                toast({
                    title: "Email Verified!",
                    description: "Redirecting you to the dashboard...",
                });
                router.push('/dashboard');
            } else {
                toast({
                    variant: "destructive",
                    title: "Still Pending",
                    description: "Your email is not verified yet. Please check your inbox.",
                });
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Verification Check Failed",
                description: error.message || "An unexpected error occurred.",
            });
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (isUserLoading || !user || user.emailVerified) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="mb-8 flex justify-center">
                    <Logo />
                </div>
                <Card>
                    <CardHeader className="items-center text-center">
                        <MailCheck className="h-12 w-12 text-primary" />
                        <CardTitle className="text-2xl mt-4">Verify Your Email</CardTitle>
                        <CardDescription>
                            A verification link has been sent to your email address:
                            <span className="font-bold text-foreground"> {user.email}</span>.
                            Please click the link to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Once you've verified, click the button below to continue to your dashboard.
                        </p>
                        <Button onClick={handleCheckVerification} disabled={isChecking} className="w-full mt-4">
                            {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            I've Verified My Email
                        </Button>
                    </CardContent>
                    <CardFooter className="flex-col gap-4 border-t pt-6">
                        <div className="text-sm text-muted-foreground">
                            Didn't receive the email?
                        </div>
                        <div className="flex w-full items-center gap-2">
                             <Button onClick={handleResendVerification} disabled={isSending} variant="outline" className="w-full">
                                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Resend Link
                            </Button>
                            <Button onClick={handleLogout} variant="secondary" className="w-full">
                                <LogOut className="mr-2 h-4 w-4"/>
                                Log Out
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
