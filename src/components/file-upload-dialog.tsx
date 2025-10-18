
"use client";

import { useState, type ReactElement } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { UploadCloud } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipContent } from "@/components/ui/tooltip";


interface FileUploadDialogProps {
  trigger: ReactElement;
  fileTypes?: string[]; 
  onUploadComplete?: (downloadURL: string) => void;
}

export function FileUploadDialog({ trigger, fileTypes }: FileUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDisabledUpload = () => {
    toast({
        variant: "default",
        title: "Feature Coming Soon",
        description: "File uploading is not yet enabled. Please check back later!",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                {trigger}
            </TooltipTrigger>
            <TooltipContent>
                <p>Feature coming soon!</p>
            </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* 
        The dialog content is kept for UI structure, but the functionality is disabled.
        This can be re-enabled later.
      */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a File</DialogTitle>
          <DialogDescription>
            Select a file from your device to upload. (This feature is currently disabled).
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
            <div className="relative flex justify-center w-full h-48 border-2 border-dashed rounded-lg border-muted-foreground/50">
              <Input
                id="file-upload"
                type="file"
                className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-not-allowed"
                accept={fileTypes?.join(",")}
                disabled
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-full text-center cursor-not-allowed"
              >
                <UploadCloud className="w-10 h-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                {fileTypes && <p className="text-xs text-muted-foreground">Allowed types: {fileTypes.join(", ")}</p>}
              </label>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDisabledUpload} disabled>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
