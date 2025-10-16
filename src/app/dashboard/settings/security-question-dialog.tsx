
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const questions = [
    "What was your first pet's name?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "In what city were you born?",
    "What is the name of your favorite childhood friend?",
];

const securityQuestionSchema = z.object({
  question: z.string().min(1, "Please select a question."),
  answer: z.string().min(3, "Answer must be at least 3 characters long."),
  confirmAnswer: z.string(),
}).refine(data => data.answer === data.confirmAnswer, {
  message: "Answers do not match.",
  path: ["confirmAnswer"],
});

const passwordConfirmSchema = z.object({
    password: z.string().min(1, "Password is required.")
})

interface SecurityQuestionDialogProps {
  user: User;
  userProfile?: { secretQuestion?: string } | null;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFinished?: () => void;
  isInitialSetup?: boolean;
}

export function SecurityQuestionDialog({
  user,
  userProfile,
  trigger,
  open,
  onOpenChange,
  onFinished,
  isInitialSetup = false
}: SecurityQuestionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isConfirmingPassword, setIsConfirmingPassword] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const form = useForm<z.infer<typeof securityQuestionSchema>>({
    resolver: zodResolver(securityQuestionSchema),
    defaultValues: { question: "", answer: "", confirmAnswer: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordConfirmSchema>>({
    resolver: zodResolver(passwordConfirmSchema),
    defaultValues: { password: "" }
  })

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        // Reset forms and state when dialog closes
        form.reset();
        passwordForm.reset();
        setIsConfirmingPassword(false);
        if (onFinished) {
            onFinished();
        }
    }
    setDialogOpen(isOpen);
  }

  const onSubmit = async (values: z.infer<typeof securityQuestionSchema>) => {
    if (!user.email) {
        toast({ variant: "destructive", title: "Error", description: "User email not found." });
        return;
    }

    if (userProfile?.secretQuestion) {
        setIsConfirmingPassword(true);
    } else {
        await saveSecurityQuestion(values);
    }
  };

  const onPasswordConfirm = async (passwordValues: z.infer<typeof passwordConfirmSchema>) => {
    if (!user.email) return;

    const credential = EmailAuthProvider.credential(user.email, passwordValues.password);
    try {
        await reauthenticateWithCredential(user, credential);
        const questionValues = form.getValues();
        await saveSecurityQuestion(questionValues);
    } catch (error: any) {
        passwordForm.setError("password", { message: "Incorrect password." });
    }
  }

  const saveSecurityQuestion = async (values: z.infer<typeof securityQuestionSchema>) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    try {
      // In a real app, the answer should be hashed before storing.
      // For this simulation, we store it as is.
      await setDoc(userRef, {
        secretQuestion: values.question,
        secretAnswer: values.answer.trim(),
      }, { merge: true });

      toast({
        title: "Security Question Saved",
        description: "Your security question has been updated.",
      });
      handleOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    }
  };

  const dialogContent = (
    <>
        <DialogHeader>
          <DialogTitle>{isInitialSetup ? 'Add an Extra Layer of Security' : 'Set/Change Security Question'}</DialogTitle>
          <DialogDescription>
            {isInitialSetup 
            ? "This question will be used to verify your identity on new devices. This step is optional."
            : "This question will be used to verify your identity if you sign in from a new device."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a security question" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {questions.map((q, i) => <SelectItem key={i} value={q}>{q}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Answer</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="confirmAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Answer</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
                {isInitialSetup && <Button type="button" variant="ghost" onClick={onFinished}>Skip for Now</Button>}
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Security Question
                </Button>
            </DialogFooter>
          </form>
        </Form>
    </>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        {isConfirmingPassword ? (
             <AlertDialog open={isConfirmingPassword} onOpenChange={setIsConfirmingPassword}>
                <AlertDialogContent>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordConfirm)}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Your Identity</AlertDialogTitle>
                            <AlertDialogDescription>
                                To change your security question, please enter your password.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <FormField
                                control={passwordForm.control}
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
                            <AlertDialogCancel type="button" onClick={() => setIsConfirmingPassword(false)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction type="submit" disabled={passwordForm.formState.isSubmitting}>
                                {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm & Save
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </Form>
                </AlertDialogContent>
             </AlertDialog>
        ) : dialogContent}
      </DialogContent>
    </Dialog>
  );
}
