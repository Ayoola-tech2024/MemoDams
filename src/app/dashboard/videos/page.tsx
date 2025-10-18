
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
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface Video {
  id: string;
  name: string;
  thumbnailUrl: string;
  duration: string;
  uploadDate: Date;
}

const placeholderVideos: Video[] = [
    { id: '1', name: 'Coastal Drone Footage', thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=2070&auto=format&fit=crop', duration: '2:45', uploadDate: new Date('2023-10-28T10:30:00Z') },
    { id: '2', name: 'Forest Time-lapse', thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop', duration: '5:12', uploadDate: new Date('2023-10-27T11:00:00Z') },
    { id: '3', name: 'City Traffic Flow', thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop', duration: '1:30', uploadDate: new Date('2023-10-26T18:00:00Z') },
    { id: '4', name: 'Galaxy Animation', thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', duration: '10:00', uploadDate: new Date('2023-10-25T09:15:00Z') },
];


export default function VideosPage() {
    const videos = placeholderVideos;
    const isLoading = false;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold md:text-3xl">Videos</h1>
         <Tooltip>
            <TooltipTrigger asChild>
                <Button size="sm" className="h-8 gap-1" disabled>
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Video</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Video upload feature coming soon!</p>
            </TooltipContent>
         </Tooltip>
      </div>

      {!isLoading && videos && videos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
          {videos.map((video) => (
            <Card key={video.id} className="group relative overflow-hidden flex flex-col">
              <CardHeader className="p-0">
                <div className="relative">
                   <div className="cursor-pointer">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.name}
                      width={400}
                      height={225}
                      className="aspect-video w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="h-16 w-16 text-white/80" />
                    </div>
                  </div>
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
                    {video.uploadDate ? format(video.uploadDate, "PP") : 'No date'}
                </p>
              </CardContent>
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 border-none text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Tooltip>
                        <TooltipTrigger asChild><DropdownMenuItem disabled><Pencil className="mr-2 h-4 w-4" />Rename</DropdownMenuItem></TooltipTrigger>
                        <TooltipContent side="left"><p>Feature coming soon!</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild><DropdownMenuItem disabled><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem></TooltipTrigger>
                        <TooltipContent side="left"><p>Feature coming soon!</p></TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild><DropdownMenuItem disabled className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></TooltipTrigger>
                        <TooltipContent side="left"><p>Feature coming soon!</p></TooltipContent>
                    </Tooltip>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!videos || videos.length === 0) && (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-4 py-12">
          <div className="flex flex-col items-center gap-1 text-center">
            <VideoIcon className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">
              You have no videos yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Start by uploading your first video.
            </p>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button className="mt-4" disabled>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Upload Video
                    </Button>
                </TooltipTrigger>
                 <TooltipContent><p>Video upload feature coming soon!</p></TooltipContent>
             </Tooltip>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
