
"use client";

import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ArrowLeft, Edit, Trash2, CalendarIcon, Loader2, Share2, Copy, Check, Globe } from "lucide-react";
import Link from "next/link";
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
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { shareNoteAction, unshareNoteAction } from "@/app/actions/share-note";


const noteSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  content: z.string().min(1, { message: "Content is required." }),
});

interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: { seconds: number; nanoseconds: number };
    updatedAt: { seconds: number; nanoseconds: number };
    sharedId?: string;
}

export default function NoteDetailPage() {
  const { noteId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);


  const noteRef = useMemoFirebase(() => {
    if (!user || !firestore || !noteId) return null;
    return doc(firestore, "users", user.uid, "notes", noteId as string);
  }, [user, firestore, noteId]);

  const { data: note, isLoading } = useDoc<Note>(noteRef);

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    values: {
        title: note?.title || "",
        content: note?.content || "",
    }
  });

  const handleDelete = async () => {
    if (!noteRef) return;
    setIsDeleting(true);
    try {
      await deleteDoc(noteRef);
      toast({
        title: "Note Deleted",
        description: "The note has been successfully deleted.",
      });
      router.push("/dashboard/notes");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Deleting Note",
        description: "There was a problem deleting your note. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  async function onEditSubmit(values: z.infer<typeof noteSchema>) {
    if (!noteRef) return;
    try {
      await updateDoc(noteRef, {
        ...values,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Note Updated",
        description: "Your note has been saved successfully.",
      });
      setIsEditOpen(false);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error Updating Note",
        description: "There was a problem saving your note. Please try again.",
      });
    }
  }

  const handleShare = async () => {
    if (!user || !note) return;
    setIsSharing(true);
    const result = await shareNoteAction(user.uid, note.id);
    if (result.success && result.url) {
        setShareUrl(result.url);
        toast({ title: "Note is now public", description: "You can share the link with anyone." });
    } else {
        toast({ variant: "destructive", title: "Sharing Failed", description: result.message });
    }
    setIsSharing(false);
  };
  
  const handleUnshare = async () => {
      if (!user || !note) return;
      setIsSharing(true);
      const result = await unshareNoteAction(user.uid, note.id);
      if (result.success) {
          setShareUrl(null);
          toast({ title: "Note is now private", description: "The public link has been disabled." });
      } else {
          toast({ variant: "destructive", title: "Action Failed", description: result.message });
      }
      setIsSharing(false);
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-8 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-4 mt-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
          </CardContent>
          <CardFooter>
             <Skeleton className="h-10 w-24" />
             <Skeleton className="h-10 w-24 ml-2" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-10">
        <p>Note not found or you don't have permission to view it.</p>
        <Button asChild variant="link" className="mt-4">
           <Link href="/dashboard/notes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back to notes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
         <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/notes">
                <ArrowLeft className="h-4 w-4" />
            </Link>
         </Button>
        <h1 className="text-2xl font-semibold md:text-3xl truncate">{note.title}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground pt-2 gap-6">
            <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Created: {format(new Date(note.createdAt.seconds * 1000), "PPp")}</span>
            </div>
             <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Last Updated: {format(new Date(note.updatedAt.seconds * 1000), "PPp")}</span>
            </div>
             {note.sharedId && (
              <div className="flex items-center gap-2 text-primary">
                <Globe className="h-4 w-4" />
                <span>Publicly shared</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
           <article className="prose dark:prose-invert lg:prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content}
            </ReactMarkdown>
          </article>
        </CardContent>
        <CardFooter className="border-t pt-6 gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Dialog open={!!shareUrl} onOpenChange={(open) => !open && setShareUrl(null)}>
                <Button variant="outline" onClick={handleShare} disabled={isSharing}>
                    {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                    Share
                </Button>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share this note</DialogTitle>
                        <DialogDescription>
                            Anyone with this link can view this note.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <Input value={shareUrl || ""} readOnly />
                        <Button onClick={copyToClipboard} size="icon">
                            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
                         <Button type="button" variant="destructive" onClick={handleUnshare}>
                            {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Make Private
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setShareUrl(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your note.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                         {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isDeleting ? 'Deleting...' : 'Yes, delete it'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>

      {/* Edit Note Dialog */}
       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="grid gap-4 py-4">
                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Content (Markdown supported)</FormLabel>
                    <FormControl>
                        <Textarea
                        className="resize-none h-64 font-mono"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                 <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
