
"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookText, FileArchive, Image as ImageIcon, Video, ArrowRight, NotebookPen, PartyPopper, MessageSquare } from "lucide-react"
import Link from 'next/link'
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy, getCountFromServer, doc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { BirthdayGreeting } from "@/components/birthday-greeting"

type CountState = {
  notes: number;
  photos: number;
  videos: number;
  files: number;
}

function OverviewCard({ title, icon: Icon, count, isLoading }: { title: string; icon: React.ElementType; count: number; isLoading: boolean; }) {
  return (
    <Card className="h-full">
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
      </CardContent>
    </Card>
  )
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 18) return { text: "Good afternoon", emoji: "👋" };
  return { text: "Good evening", emoji: "🌙" };
}

function BirthdayBanner({ name }: { name?: string | null }) {
    return (
        <div className="relative overflow-hidden rounded-lg bg-primary/10 p-4 text-center mb-6 border border-primary/20">
             <div
                aria-hidden="true"
                className="absolute inset-0 z-0 grid grid-cols-2 -space-x-52 opacity-20"
            >
                <div className="h-60 bg-gradient-to-br from-primary to-purple-400 blur-3xl dark:h-96 animate-float"></div>
                <div className="h-60 bg-gradient-to-r from-accent to-cyan-400 blur-3xl dark:h-96 animate-float" style={{ animationDelay: '3s' }}></div>
            </div>
            <div className="relative z-10">
                <PartyPopper className="mx-auto h-8 w-8 text-primary animate-bounce" />
                <h2 className="mt-2 text-xl font-bold text-primary">Happy Birthday, {name}!</h2>
                <p className="text-sm text-primary/80">Hope you have a wonderful day filled with joy and celebration!</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
  const { user } = useUser()
  const firestore = useFirestore()
  const [greeting, setGreeting] = useState({ text: "", emoji: "" });
  const [counts, setCounts] = useState<CountState>({ notes: 0, photos: 0, videos: 0, files: 0 });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

   const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);

  useEffect(() => {
    setGreeting(getGreeting());

    async function fetchCounts() {
      if (!user || !firestore) return;
      setIsLoadingCounts(true);
      try {
        const notesQuery = query(collection(firestore, 'users', user.uid, 'notes'));
        const photosQuery = query(collection(firestore, 'users', user.uid, 'files'), where("fileType", "in", ["image/jpeg", "image/png", "image/gif", "image/webp"]));
        const videosQuery = query(collection(firestore, 'users', user.uid, 'files'), where("fileType", "in", ["video/mp4", "video/webm", "video/ogg"]));
        const allFilesQuery = query(collection(firestore, 'users', user.uid, 'files'));

        const [notesSnap, photosSnap, videosSnap, filesSnap] = await Promise.all([
          getCountFromServer(notesQuery),
          getCountFromServer(photosQuery),
          getCountFromServer(videosQuery),
          getCountFromServer(allFilesQuery),
        ]);
        
        setCounts({
          notes: notesSnap.data().count,
          photos: photosSnap.data().count,
          videos: videosSnap.data().count,
          files: filesSnap.data().count,
        });

      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setIsLoadingCounts(false);
      }
    }

    fetchCounts();

  }, [user, firestore]);

  const recentNotesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'notes'), orderBy("createdAt", "desc"));
  }, [user, firestore]);
  const { data: recentNotes, isLoading: isLoadingNotes } = useCollection(recentNotesQuery);

  const recentFilesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'files'), orderBy("uploadDate", "desc"));
  }, [user, firestore]);
  const { data: recentUploads, isLoading: isLoadingFiles } = useCollection(recentFilesQuery);

  const overviewItems = [
    { title: "Notes", count: counts.notes, icon: BookText, href: "/dashboard/notes", isLoading: isLoadingCounts },
    { title: "Photos", count: counts.photos, icon: ImageIcon, href: "/dashboard/photos", isLoading: isLoadingCounts },
    { title: "Videos", count: counts.videos, icon: Video, href: "/dashboard/videos", isLoading: isLoadingCounts },
    { title: "Files", count: counts.files, icon: FileArchive, href: "/dashboard/files", isLoading: isLoadingCounts },
  ]

  const isBirthday = () => {
    if (!userProfile?.birthday) return false;
    const today = new Date();
    const birthDate = new Date(userProfile.birthday);
    return today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate();
  };

  const isBirthdayToday = isBirthday();
  const userName = user?.displayName?.split(' ')[0];

  return (
    <div className="animate-in fade-in duration-500">
      {isBirthdayToday && <BirthdayGreeting name={userName} />}
      {isBirthdayToday && <BirthdayBanner name={userName} />}
      
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="text-xl font-semibold tracking-tight md:text-3xl">
            {greeting.text}, {userName || 'friend'}! {greeting.emoji}
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
             Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {overviewItems.map((item, index) => (
          <div key={item.title} className="animate-in fade-in slide-in-from-top-4" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
            <OverviewCard title={item.title} icon={item.icon} count={item.count} isLoading={item.isLoading} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-full md:col-span-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
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
            ) : recentNotes && recentNotes.length > 0 ? (
               <div className="space-y-4">
                {(recentNotes.slice(0, 2) || []).map(note => (
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
        <Card className="col-span-full md:col-span-3 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '600ms', animationFillMode: 'backwards' }}>
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
            ) : recentUploads && recentUploads.length > 0 ? (
               <div className="space-y-4">
                {(recentUploads.slice(0, 2) || []).map(file => (
                  <div key={file.id} className="flex items-center gap-4">
                    <div className="rounded-md bg-secondary p-3">
                      {file.fileType.startsWith('image/') ? <ImageIcon className="h-5 w-5 text-muted-foreground" /> : <FileArchive className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none truncate">{file.name}</p>
                       <p className="text-sm text-muted-foreground">
                        {file.uploadDate ? new Date(file.uploadDate.seconds * 1000).toLocaleDateString() : 'Uploaded recently'}
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

    