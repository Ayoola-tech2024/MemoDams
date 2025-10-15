
"use client";

import { useState, type ReactElement, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useUser, useFirestore } from "@/firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FileUploadDialogProps {
  trigger: ReactElement;
  fileTypes?: string[]; // e.g., ["image/png", "image/jpeg"]
}

export function FileUploadDialog({ trigger, fileTypes }: FileUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !firestore) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "No file selected or user not logged in.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const storage = getStorage();
    const storageRef = ref(storage, `users/${user.uid}/files/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "You do not have permission to upload files. Please check storage rules.",
        });
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        try {
          await addDoc(collection(firestore, "users", user.uid, "files"), {
            name: file.name,
            url: downloadURL,
            fileType: file.type,
            fileSize: file.size,
            uploadDate: serverTimestamp(),
            userId: user.uid,
          });

          toast({
            title: "Upload Successful",
            description: `${file.name} has been uploaded.`,
          });
          
          startTransition(() => {
            router.refresh();
          });
          
          handleClose();

        } catch (firestoreError: any) {
             console.error("Firestore write failed:", firestoreError);
             toast({
                variant: "destructive",
                title: "Failed to save file metadata",
                description: "The file was uploaded, but we couldn't save its details. Check Firestore rules."
             });
             setIsUploading(false);
        }
      }
    );
  };

  const handleClose = () => {
    setOpen(false);
    // Delay resetting file state to avoid dialog content flicker while closing
    setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
        setIsUploading(false);
    }, 300);
  };
  
  const onDialogOpenChange = (isOpen: boolean) => {
    if (isUploading) return;
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent onInteractOutside={(e) => { if (isUploading) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>Upload a File</DialogTitle>
          <DialogDescription>
            Select a file from your device to upload.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!file && !isUploading ? (
            <div className="relative flex justify-center w-full h-48 border-2 border-dashed rounded-lg border-muted-foreground/50">
              <Input
                id="file-upload"
                type="file"
                className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept={fileTypes?.join(",")}
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-full text-center cursor-pointer"
              >
                <UploadCloud className="w-10 h-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                {fileTypes && <p className="text-xs text-muted-foreground">Allowed types: {fileTypes.join(", ")}</p>}
              </label>
            </div>
          ) : file && (
            <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    {!isUploading && (
                        <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-center text-muted-foreground mt-2">{Math.round(uploadProgress)}% uploaded</p>
                  </div>
                )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading || isPending}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
