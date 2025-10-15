
"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, ListFilter, NotebookPen } from "lucide-react"
import Link from 'next/link'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number; nanoseconds: number; };
  tags?: string[];
}

function NoteSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
}


export default function NotesPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'notes'), orderBy("createdAt", "desc"));
  }, [user, firestore]);

  const { data: notes, isLoading } = useCollection<Note>(notesQuery);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Notes</h1>
        <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Work</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Personal</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Idea</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Create Note</span>
          </Button>
        </div>
      </div>

      {isLoading && (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <NoteSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && notes && notes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <Card key={note.id} className="flex flex-col transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                 <CardDescription>
                  {note.createdAt ? format(new Date(note.createdAt.seconds * 1000), "MMMM dd, yyyy") : 'No date'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-4 text-sm text-muted-foreground">{note.content}</p>
              </CardContent>
              <CardFooter>
                 {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!notes || notes.length === 0) && (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <NotebookPen className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">
              You have no notes yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start by creating a new note to capture your thoughts.
            </p>
            <Button className="mt-4">
               <PlusCircle className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
