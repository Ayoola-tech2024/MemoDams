"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PlusCircle, PlayCircle, MoreVertical, Download, Trash2, Pencil, Video as VideoIcon } from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadDialog } from "@/components/file-upload-dialog";

interface Video {
  id: string;
  name: string;
  url: string; // URL to the video file
  thumbnailUrl?: string; // URL to a thumbnail image
  duration?: string;
}

function VideoSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4" />
      </CardContent>
    </Card>
  );
}

export default function VideosPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const videosQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'files'),
            where("fileType", "in", ["video/mp4", "video/webm", "video/ogg"]),
            orderBy("uploadDate", "desc")
        );
    }, [user, firestore]);

    const { data: videos, isLoading } = useCollection<Video>(videosQuery);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Videos</h1>
        <FileUploadDialog
          fileTypes={["video/mp4", "video/webm", "video/ogg"]}
          trigger={
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Video</span>
            </Button>
          }
        />
      </div>

       {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <VideoSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && videos && videos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <Card key={video.id} className="group relative overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative">
                  <Image
                    src={video.thumbnailUrl || `https://picsum.photos/seed/${video.id}/400/225`}
                    alt={video.name}
                    width={400}
                    height={225}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-16 w-16 text-white/80" />
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-sm">
                      {video.duration}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{video.name}</h3>
              </CardContent>
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!videos || videos.length === 0) && (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <VideoIcon className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">
              You have no videos yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start by uploading your first video.
            </p>
            <FileUploadDialog
              fileTypes={["video/mp4", "video/webm", "video/ogg"]}
              trigger={
                <Button className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
              }
            />
          </div>
        </div>
      )}
    </>
  )
}
