
"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  File as FileIcon,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  PlusCircle,
  MoreHorizontal,
  FileArchive,
  Download,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadDialog } from "@/components/file-upload-dialog";
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
} from "@/components/ui/alert-dialog"
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


interface File {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadDate: { seconds: number; nanoseconds: number; };
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (type.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-500" />;
  if (type.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-orange-500" />;
  if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  return <FileIcon className="h-5 w-5 text-muted-foreground" />;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const renameFileSchema = z.object({
  name: z.string().min(1, "File name cannot be empty"),
});

export default function FilesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);
  const [fileToRename, setFileToRename] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'users', user.uid, 'files'),
        orderBy("uploadDate", "desc")
    );
  }, [user, firestore]);

  const { data: files, isLoading } = useCollection<File>(filesQuery);

  const renameForm = useForm<z.infer<typeof renameFileSchema>>({
    resolver: zodResolver(renameFileSchema),
    defaultValues: { name: "" },
  });

  const handleDownload = (file: File) => {
    try {
      // Using a link element to trigger the download
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
        toast({ title: "File Deleted", description: `"${fileToDelete.name}" has been deleted.` });
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
      toast({ title: "File Renamed", description: `Successfully renamed to "${values.name}".`});
      setFileToRename(null);
      renameForm.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Rename Failed", description: error.message });
    }
  };
  
  const openRenameDialog = (file: File) => {
    setFileToRename(file);
    renameForm.setValue("name", file.name);
  };


  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold md:text-3xl">Files</h1>
         <FileUploadDialog trigger={
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload File</span>
            </Button>
          } />
      </div>

       {isLoading && (
        <Card className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32 md:w-48" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {!isLoading && files && files.length > 0 && (
         <Card className="mt-4">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="hidden md:table-cell">Date Uploaded</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.fileType)}
                        <span className="truncate">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatBytes(file.fileSize)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {file.uploadDate ? format(new Date(file.uploadDate.seconds * 1000), "PPp") : 'No date'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRenameDialog(file)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFileToDelete(file)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {!isLoading && (!files || files.length === 0) && (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-4 py-12">
          <div className="flex flex-col items-center gap-1 text-center">
            <FileArchive className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">
              You have no files yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start by uploading your first file.
            </p>
             <FileUploadDialog trigger={
              <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload File
              </Button>
             } />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{fileToDelete?.name}" from your storage.
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
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

    