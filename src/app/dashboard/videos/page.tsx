
"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { PlusCircle, PlayCircle, MoreVertical, Download, Trash2, Pencil, Video as VideoIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { deleteFileAction } from "@/app/actions/delete-file";


interface Video {
  id: string;
  name: string;
  url: string; // URL to the video file
  thumbnailUrl?: string; // URL to a thumbnail image
  duration?: string;
  uploadDate: { seconds: number; nanoseconds: number; };
}

function VideoSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardContent>
    </Card>
  );
}

const videoMimeTypes = ["video/mp4", "video/webm", "video/ogg"];

const renameFileSchema = z.object({
  name: z.string().min(1, "File name cannot be empty"),
});

export default function VideosPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [fileToDelete, setFileToDelete] = useState<Video | null>(null);
    const [fileToRename, setFileToRename] = useState<Video | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const videosQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'files'),
            where("fileType", "in", videoMimeTypes),
            orderBy("uploadDate", "desc")
        );
    }, [user, firestore]);

    const { data: videos, isLoading } = useCollection<Video>(videosQuery);

    const renameForm = useForm<z.infer<typeof renameFileSchema>>({
      resolver: zodResolver(renameFileSchema),
    });

    const handleDownload = (file: Video) => {
      try {
        const link = document.createElement('a');
        link.href = file.url;
        link.target = '_blank';
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Downloading", description: `"${file.name}" has started downloading.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Download Failed", description: "Could not download the file." });
      }
    };

    const handleDelete = async () => {
      if (!fileToDelete || !user) return;
      setIsDeleting(true);
      try {
        const filePath = decodeURIComponent(new URL(fileToDelete.url).pathname.split('/o/')[1]).split('?')[0];
        const result = await deleteFileAction(user.uid, fileToDelete.id, filePath);
  
        if (result.success) {
          toast({ title: "Video Deleted", description: `"${fileToDelete.name}" has been deleted.` });
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        toast({ variant: "destructive", title: "Deletion Failed", description: error.message || "An unexpected error occurred." });
      } finally {
        setIsDeleting(false);
        setFileToDelete(null);
      }
    };
    
    const handleRenameSubmit = async (values: z.infer<typeof renameFileSchema>) => {
      if (!fileToRename || !user || !firestore) return;
      
      const fileRef = doc(firestore, 'users', user.uid, 'files', fileToRename.id);
      try {
        await updateDoc(fileRef, { name: values.name });
        toast({ title: "Video Renamed", description: `Successfully renamed to "${values.name}".`});
        setFileToRename(null);
        renameForm.reset();
      } catch (error: any) {
        toast({ variant: "destructive", title: "Rename Failed", description: error.message });
      }
    };
    
    const openRenameDialog = (video: Video) => {
      setFileToRename(video);
      renameForm.setValue("name", video.name);
    };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Videos</h1>
        <FileUploadDialog
          fileTypes={videoMimeTypes}
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
            <Card key={video.id} className="group relative overflow-hidden flex flex-col">
              <CardHeader className="p-0">
                <div className="relative">
                   <a href={video.url} target="_blank" rel="noopener noreferrer">
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
                  </a>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-sm">
                      {video.duration}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <h3 className="font-semibold truncate">{video.name}</h3>
                 <p className="text-xs text-muted-foreground">
                    {video.uploadDate ? format(new Date(video.uploadDate.seconds * 1000), "PP") : 'No date'}
                </p>
              </CardContent>
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openRenameDialog(video)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(video)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFileToDelete(video)} className="text-destructive">
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
              fileTypes={videoMimeTypes}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{fileToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? 'Deleting...' : 'Yes, delete it'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename File Dialog */}
      <Dialog open={!!fileToRename} onOpenChange={(open) => !open && setFileToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Video</DialogTitle>
          </DialogHeader>
          <form onSubmit={renameForm.handleSubmit(handleRenameSubmit)} className="space-y-4">
            <Input {...renameForm.register("name")} />
            {renameForm.formState.errors.name && (
              <p className="text-sm text-destructive">{renameForm.formState.errors.name.message}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFileToRename(null)}>Cancel</Button>
              <Button type="submit" disabled={renameForm.formState.isSubmitting}>
                {renameForm.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
