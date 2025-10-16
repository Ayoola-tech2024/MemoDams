
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, ConfirmationResult, MultiFactorUser, MultiFactorInfo, RecaptchaVerifier } from "firebase/auth";
import { Loader2, ShieldCheck, ShieldOff, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

interface PhoneAuthDialogProps {
  user: User;
  enrolledFactors: MultiFactorInfo[];
}

const addPhoneSchema = z.object({
  phoneNumber: z.string().min(10, "Please enter a valid phone number with country code (e.g., +15551234567)."),
});

const verifyCodeSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits."),
});

export function PhoneAuthDialog({ user, enrolledFactors }: PhoneAuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"addPhone" | "verifyCode">("addPhone");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  
  const isEnrolled = enrolledFactors.length > 0;

  const phoneForm = useForm<z.infer<typeof addPhoneSchema>>({
    resolver: zodResolver(addPhoneSchema),
  });
  const codeForm = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
  });

  const onAddPhone = async (values: z.infer<typeof addPhoneSchema>) => {
    if (!auth) return;
    setIsVerifying(true);
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      window.confirmationResult = await phoneProvider.verifyPhoneNumber(
        values.phoneNumber,
        window.recaptchaVerifier!
      );

      setStep("verifyCode");
      toast({ title: "Verification code sent", description: "Enter the code sent to your phone." });
    } catch (error: any) {
      console.error("Phone enrollment failed", error);
      toast({ variant: "destructive", title: "Failed to send code", description: error.message });
      phoneForm.setError("phoneNumber", { message: "Failed to send code. Please check the number and try again." });
    } finally {
      setIsVerifying(false);
    }
  };

  const onVerifyCode = async (values: z.infer<typeof verifyCodeSchema>) => {
    if (!window.confirmationResult) return;
    setIsVerifying(true);
    try {
      const cred = PhoneAuthProvider.credential(window.confirmationResult.verificationId, values.code);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(user).enroll(multiFactorAssertion, 'My-Phone-Number');
      
      toast({ title: "2FA Enabled", description: "Your phone number has been verified and enabled for 2FA.", className: "bg-green-500 text-white" });
      handleClose();
      router.refresh();
    } catch (error: any) {
      console.error("Code verification failed", error);
      codeForm.setError("code", { message: "Invalid verification code." });
    } finally {
      setIsVerifying(false);
    }
  };

  const onUnenroll = async () => {
    setIsUnenrolling(true);
    try {
        const factorUid = enrolledFactors[0].uid;
        await multiFactor(user).unenroll(factorUid);
        toast({ title: "2FA Disabled", description: "Phone number authentication has been removed." });
        handleClose();
        router.refresh();
    } catch (error: any) {
        console.error("Unenrollment failed", error);
        toast({ variant: "destructive", title: "Failed to disable 2FA", description: error.message });
    } finally {
        setIsUnenrolling(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
        setStep("addPhone");
        phoneForm.reset();
        codeForm.reset();
        window.confirmationResult = undefined;
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
    }, 300);
  }

  useEffect(() => {
    if (isOpen && step === "addPhone" && !isEnrolled) {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                auth,
                'recaptcha-container',
                {
                    'size': 'invisible',
                    'callback': () => {
                        // reCAPTCHA solved, allow signInWithPhoneNumber.
                    }
                }
            );
        }
        window.recaptchaVerifier.render().catch((err: any) => console.error("Recaptcha render error", err));
    }
  }, [isOpen, step, isEnrolled, auth]);


  if (isEnrolled) {
    return (
       <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Disable 2FA
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove your phone number and disable Two-Factor Authentication.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onUnenroll} disabled={isUnenrolling}>
                        {isUnenrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm & Disable
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Enable 2FA
        </Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => { if (isVerifying) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>{step === "addPhone" ? "Enable Two-Factor Authentication" : "Verify Your Phone"}</DialogTitle>
          <DialogDescription>
            {step === "addPhone" 
                ? "Enter your phone number. A verification code will be sent to it."
                : "Enter the 6-digit code we sent to your phone."
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'addPhone' && (
             <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onAddPhone)} className="space-y-4 py-4">
                    <FormField
                    control={phoneForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <div className="relative">
                               <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input {...field} placeholder="+15551234567" className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <DialogFooter>
                        <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                        <Button type="submit" disabled={isVerifying}>
                            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Code
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        )}

        {step === 'verifyCode' && (
            <Form {...codeForm}>
                <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-4 py-4">
                    <FormField
                    control={codeForm.control}
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
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setStep('addPhone')}>Back</Button>
                        <Button type="submit" disabled={isVerifying}>
                            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify & Enable
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        )}

      </DialogContent>
    </Dialog>
  );
}
