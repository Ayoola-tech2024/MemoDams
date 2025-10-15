"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, MoreVertical, Download, Trash2, Pencil, Image as ImageIcon } from "lucide-react"
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

interface Photo {
  id: string;
  name: string;
  url: string;
  // data-ai-hint can be derived from name or another field if needed
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

export default function PhotosPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const photosQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'files'), 
      where("fileType", "in", ["image/jpeg", "image/png", "image/gif", "image/webp"]),
      orderBy("uploadDate", "desc")
    );
  }, [user, firestore]);

  const { data: photos, isLoading } = useCollection<Photo>(photosQuery);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Photos</h1>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Photo</span>
        </Button>
      </div>

       {isLoading && (
         <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => <PhotoSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && photos && photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {photos.map((photo) => (
            <Card key={photo.id} className="group relative overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={photo.url}
                  alt={photo.name}
                  width={400}
                  height={300}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
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
            <Button className="mt-4">
               <PlusCircle className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
