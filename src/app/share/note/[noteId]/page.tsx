
import { initializeAdmin } from "@/firebase/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from 'date-fns';
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CalendarIcon, User } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SharedNote {
    title: string;
    content: string;
    createdAt: { seconds: number; nanoseconds: number };
    updatedAt: { seconds: number; nanoseconds: number };
    authorName: string;
}

async function getSharedNote(noteId: string): Promise<SharedNote | null> {
    try {
        const adminApp = initializeAdmin();
        const adminFirestore = adminApp.firestore();
        const noteRef = adminFirestore.collection('sharedNotes').doc(noteId);
        const docSnap = await noteRef.get();

        if (docSnap.exists) {
            return docSnap.data() as SharedNote;
        }
        return null;
    } catch (error) {
        console.error("Error fetching shared note:", error);
        return null;
    }
}

export default async function SharedNotePage({ params }: { params: { noteId: string } }) {
    const note = await getSharedNote(params.noteId);

    if (!note) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/20">
             <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center justify-between">
                    <Logo />
                    <Button asChild>
                      <Link href="/signup">
                        Create Your Own Notes
                      </Link>
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-8 md:py-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl md:text-4xl">{note.title}</CardTitle>
                        <div className="flex flex-wrap items-center text-sm text-muted-foreground pt-4 gap-x-6 gap-y-2">
                             <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>By {note.authorName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span>Published: {format(new Date(note.createdAt.seconds * 1000), "PPP")}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <article className="prose dark:prose-invert lg:prose-lg max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {note.content}
                            </ReactMarkdown>
                        </article>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export const revalidate = 60; // Revalidate the page every 60 seconds
