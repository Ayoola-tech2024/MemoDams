
"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PlusCircle, MoreVertical, Download, Trash2, Pencil, Image as ImageIcon, Loader2 } from "lucide-react"
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


interface Photo {
  id: string;
  name: string;
  url: string;
  uploadDate: { seconds: number; nanoseconds: number; };
}

function PhotoSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-[4/3] w-full" />
      </CardContent>
    </Card>
  );
}

const photoMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const renameFileSchema = z.object({
  name: z.string().min(1, "File name cannot be empty"),
});

export default function PhotosPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [fileToDelete, setFileToDelete] = useState<Photo | null>(null);
  const [fileToRename, setFileToRename] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const photosQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'files'), 
      where("fileType", "in", photoMimeTypes),
      orderBy("uploadDate", "desc")
    );
  }, [user, firestore]);

  const { data: photos, isLoading } = useCollection<Photo>(photosQuery);

  const renameForm = useForm<z.infer<typeof renameFileSchema>>({
    resolver: zodResolver(renameFileSchema),
  });

  const handleDownload = (file: Photo) => {
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
        toast({ title: "Photo Deleted", description: `"${fileToDelete.name}" has been deleted.` });
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
      toast({ title: "Photo Renamed", description: `Successfully renamed to "${values.name}".`});
      setFileToRename(null);
      renameForm.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Rename Failed", description: error.message });
    }
  };
  
  const openRenameDialog = (photo: Photo) => {
    setFileToRename(photo);
    renameForm.setValue("name", photo.name);
  };


  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Photos</h1>
        <FileUploadDialog
          fileTypes={photoMimeTypes}
          trigger={
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Photo</span>
            </Button>
          }
        />
      </div>

       {isLoading && (
         <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => <PhotoSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && photos && photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {photos.map((photo) => (
            <Card key={photo.id} className="group relative overflow-hidden flex flex-col">
              <CardContent className="p-0">
                <Image
                  src={photo.url}
                  alt={photo.name}
                  width={400}
                  height={300}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </CardContent>
              <CardFooter className="p-2 mt-auto bg-background/80 backdrop-blur-sm">
                <div className="truncate">
                    <p className="text-sm font-medium truncate">{photo.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {photo.uploadDate ? format(new Date(photo.uploadDate.seconds * 1000), "PP") : 'No date'}
                    </p>
                </div>
              </CardFooter>
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openRenameDialog(photo)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(photo)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFileToDelete(photo)} className="text-destructive">
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
      
      {!isLoading && (!photos || photos.length === 0) && (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">
              You have no photos yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start by uploading your first photo.
            </p>
            <FileUploadDialog
              fileTypes={photoMimeTypes}
              trigger={
                <Button className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload Photo
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
            <DialogTitle>Rename Photo</DialogTitle>
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
