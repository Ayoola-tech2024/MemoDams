
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, multiFactor, TotpMultiFactorGenerator, reauthenticateWithCredential, EmailAuthProvider, TotpSecret } from "firebase/auth";
import QRCode from 'qrcode';
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";


interface TwoFactorAuthDialogProps {
  user: User;
}

const verifyCodeSchema = z.object({
    code: z.string().length(6, "Verification code must be 6 digits."),
});


export function Enable2faDialog({ user }: TwoFactorAuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    }
  });

  const handleGenerateSecret = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await multiFactor(user).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(session);
      setTotpSecret(secret);
      const qrCodeData = await QRCode.toDataURL(secret.toUri());
      setQrCodeDataUrl(qrCodeData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate 2FA secret",
        description: error.message,
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const onVerify = async (values: z.infer<typeof verifyCodeSchema>) => {
    if (!totpSecret) return;
    setIsVerifying(true);
    try {
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        totpSecret,
        values.code
      );
      await multiFactor(user).enroll(multiFactorAssertion, user.email || 'MemoDams-2FA');
      toast({
        title: "2FA Enabled Successfully",
        description: "Two-Factor Authentication is now active on your account.",
        className: "bg-green-500 text-white"
      });
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      form.setError("code", { message: "Invalid verification code." });
    } finally {
      setIsVerifying(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      handleGenerateSecret();
    } else {
        // Reset state when dialog closes
        setTotpSecret(null);
        setQrCodeDataUrl(null);
        setIsLoading(false);
        setIsVerifying(false);
        form.reset();
    }
  }, [isOpen, handleGenerateSecret, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Enable 2FA
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Scan the QR code with your authenticator app, then enter the code to verify.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )}

        {qrCodeDataUrl && totpSecret && (
            <div className="flex flex-col items-center gap-4 py-4">
                <Image src={qrCodeDataUrl} alt="2FA QR Code" width={200} height={200} />
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Or enter this code manually:</p>
                    <p className="font-mono tracking-widest bg-muted p-2 rounded-md">{totpSecret.secretKey}</p>
                </div>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onVerify)} className="w-full max-w-xs space-y-4">
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
                        <Button type="submit" disabled={isVerifying} className="w-full">
                            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Verify & Enable
                        </Button>
                    </form>
                </Form>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


const disable2faSchema = z.object({
  password: z.string().min(1, "Password is required to disable 2FA."),
});

export function Disable2faDialog({ user }: TwoFactorAuthDialogProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDisabling, setIsDisabling] = useState(false);

    const form = useForm<z.infer<typeof disable2faSchema>>({
        resolver: zodResolver(disable2faSchema),
        defaultValues: {
            password: "",
        }
    });

    const onDisable = async (values: z.infer<typeof disable2faSchema>) => {
        if (!user.email) return;
        setIsDisabling(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, values.password);
            await reauthenticateWithCredential(user, credential);
            
            const multiFactorUser = multiFactor(user);
            // Assuming the user only has one factor (TOTP) enrolled
            const uid = multiFactorUser.enrolledFactors[0].uid;
            await multiFactorUser.unenroll(uid);

            toast({
                title: "2FA Disabled",
                description: "Two-Factor Authentication has been turned off.",
            });
            form.reset();
            router.refresh();
        } catch (error: any) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                form.setError("password", { message: "Incorrect password." });
            } else {
                toast({ variant: "destructive", title: "Failed to disable 2FA", description: error.message });
            }
        } finally {
            setIsDisabling(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Disable 2FA
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onDisable)}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to disable 2FA?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove the extra layer of security from your account. Please enter your password to confirm.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <div className="py-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} autoFocus />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction type="submit" disabled={isDisabling} className="bg-destructive hover:bg-destructive/90">
                                {isDisabling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Confirm & Disable
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
