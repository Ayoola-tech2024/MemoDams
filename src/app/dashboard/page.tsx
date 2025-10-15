
"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookText, FileArchive, Image as ImageIcon, Video, ArrowRight, NotebookPen } from "lucide-react"
import Link from 'next/link'
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy, getCountFromServer } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface OverviewItemProps {
  title: string;
  icon: React.ElementType;
  href: string;
  count: number;
  isLoading: boolean;
}

function OverviewCard({ title, icon: Icon, href, count, isLoading }: OverviewItemProps) {
  return (
    <Link href={href} className="block">
      <Card className="transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-1/3" />
          ) : (
            <div className="text-2xl font-bold">{count}</div>
          )}
          <p className="text-xs text-muted-foreground flex items-center">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 18) return { text: "Good afternoon", emoji: "👋" };
  return { text: "Good evening", emoji: "🌙" };
}

export default function DashboardPage() {
  const { user } = useUser()
  const firestore = useFirestore()
  const [greeting, setGreeting] = useState({ text: "", emoji: "" });

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const notesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'notes'), orderBy("createdAt", "desc"));
  }, [user, firestore]);
  const { data: notes, isLoading: isLoadingNotes } = useCollection(notesQuery);

  const photosQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'files'), where("fileType", ">=", "image/"), where("fileType", "<", "image/~"));
  }, [user, firestore]);
  const { data: photos, isLoading: isLoadingPhotos } = useCollection(photosQuery);
  
  const videosQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'files'), where("fileType", ">=", "video/"), where("fileType", "<", "video/~"));
  }, [user, firestore]);
  const { data: videos, isLoading: isLoadingVideos } = useCollection(videosQuery);

  const filesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'files'));
  }, [user, firestore]);
  const { data: files, isLoading: isLoadingFiles } = useCollection(filesQuery);

  const recentNotes = notes?.slice(0, 2) || [];

  const recentUploads = files?.sort((a, b) => b.uploadDate.seconds - a.uploadDate.seconds).slice(0, 2) || [];
  
  const overviewItems = [
    { title: "Notes", count: notes?.length ?? 0, icon: BookText, href: "/dashboard/notes", isLoading: isLoadingNotes },
    { title: "Photos", count: photos?.length ?? 0, icon: ImageIcon, href: "/dashboard/photos", isLoading: isLoadingPhotos },
    { title: "Videos", count: videos?.length ?? 0, icon: Video, href: "/dashboard/videos", isLoading: isLoadingVideos },
    { title: "Files", count: files?.length ?? 0, icon: FileArchive, href: "/dashboard/files", isLoading: isLoadingFiles },
  ]

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {greeting.text}, {user?.displayName?.split(' ')[0] || 'friend'}! {greeting.emoji}
          </h1>
          <p className="text-muted-foreground">
             Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {overviewItems.map((item, index) => (
          <div key={item.title} className="animate-in fade-in slide-in-from-top-4" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
            <OverviewCard {...item} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>
              A glimpse of your latest thoughts and ideas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingNotes ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ) : recentNotes.length > 0 ? (
               <div className="space-y-4">
                {recentNotes.map(note => (
                   <div key={note.id} className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{note.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{note.content}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/notes/${note.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center text-center py-8">
                  <NotebookPen className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold">No recent notes</h3>
                  <p className="text-sm text-muted-foreground">Your latest notes will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '600ms', animationFillMode: 'backwards' }}>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>
              Your latest photos, videos, and files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFiles ? (
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <Skeleton className="h-12 w-12 rounded-md" />
                     <div className="space-y-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-4 w-24" />
                     </div>
                  </div>
                   <div className="flex items-center gap-4">
                     <Skeleton className="h-12 w-12 rounded-md" />
                     <div className="space-y-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-4 w-24" />
                     </div>
                  </div>
                </div>
            ) : recentUploads.length > 0 ? (
               <div className="space-y-4">
                {recentUploads.map(file => (
                  <div key={file.id} className="flex items-center gap-4">
                    <div className="rounded-md bg-secondary p-3">
                      {file.fileType.startsWith('image/') ? <ImageIcon className="h-5 w-5 text-muted-foreground" /> : <FileArchive className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none truncate">{file.name}</p>
                       <p className="text-sm text-muted-foreground">
                        {file.uploadDate ? format(new Date(file.uploadDate.seconds * 1000), "PPp") : 'Uploaded recently'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center text-center py-8">
                  <FileArchive className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold">No recent uploads</h3>
                  <p className="text-sm text-muted-foreground">Your latest files will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
