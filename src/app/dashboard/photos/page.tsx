
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
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface Photo {
  id: string;
  name: string;
  url: string;
  uploadDate: Date;
  width: number;
  height: number;
}

const placeholderPhotos: Photo[] = [
    { id: '1', name: 'Misty Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop', uploadDate: new Date('2023-10-28T08:30:00Z'), width: 2070, height: 1380 },
    { id: '2', name: 'Northern Lights', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2070&auto=format&fit=crop', uploadDate: new Date('2023-10-27T18:45:00Z'), width: 2070, height: 1380 },
    { id: '3', name: 'Desert Dunes', url: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=2070&auto=format&fit=crop', uploadDate: new Date('2023-10-26T12:10:00Z'), width: 2070, height: 1380 },
    { id: '4', name: 'Forest Path', url: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=1974&auto=format&fit=crop', uploadDate: new Date('2023-10-25T09:00:00Z'), width: 1974, height: 1316 },
    { id: '5', name: 'City at Night', url: 'https://images.unsplash.com/photo-1531932468339-319b2a640106?q=80&w=2067&auto=format&fit=crop', uploadDate: new Date('2023-10-24T22:30:00Z'), width: 2067, height: 1378 },
    { id: '6', name: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=2069&auto=format&fit=crop', uploadDate: new Date('2023-10-23T16:05:00Z'), width: 2069, height: 1379 },
    { id: '7', name: 'Abstract Colors', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop', uploadDate: new Date('2023-10-22T11:00:00Z'), width: 2070, height: 1380 },
    { id: '8', name: 'Modern Architecture', url: 'https://images.unsplash.com/photo-1429497419816-9ca5cfb4571a?q=80&w=2071&auto=format&fit=crop', uploadDate: new Date('2023-10-21T14:20:00Z'), width: 2071, height: 1381 },
];


export default function PhotosPage() {
  const photos = placeholderPhotos;
  const isLoading = false;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Photos</h1>
        <Tooltip>
            <TooltipTrigger>
                <Button size="sm" className="h-8 gap-1" disabled>
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Photo</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Photo upload feature coming soon!</p>
            </TooltipContent>
        </Tooltip>
      </div>


      {!isLoading && photos && photos.length > 0 ? (
        <div className="mt-4 columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
          {photos.map((photo, index) => (
            <Card key={photo.id} className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg">
                <Image
                  src={photo.url}
                  alt={photo.name}
                  width={photo.width}
                  height={photo.height}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-sm font-semibold text-white truncate">{photo.name}</p>
                    <p className="text-xs text-white/80">
                        {format(photo.uploadDate, "PP")}
                    </p>
              </div>

              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Tooltip>
                        <TooltipTrigger className="w-full"><DropdownMenuItem disabled><Pencil className="mr-2 h-4 w-4" />Rename</DropdownMenuItem></TooltipTrigger>
                        <TooltipContent side="left"><p>Feature coming soon!</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger className="w-full"><DropdownMenuItem disabled><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem></TooltipTrigger>
                        <TooltipContent side="left"><p>Feature coming soon!</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger className="w-full"><DropdownMenuItem disabled className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></TooltipTrigger>
                        <TooltipContent side="left"><p>Feature coming soon!</p></TooltipContent>
                    </Tooltip>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">
              You have no photos yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start by uploading your first photo.
            </p>
             <Tooltip>
                <TooltipTrigger>
                    <Button className="mt-4" disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Upload Photo
                    </Button>
                </TooltipTrigger>
                 <TooltipContent><p>Photo upload feature coming soon!</p></TooltipContent>
             </Tooltip>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
