import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { PlusCircle, PlayCircle, MoreVertical, Download, Trash2, Pencil } from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const videos = [
  { id: 1, title: "Summer Vacation Highlights", duration: "3:45", thumbnail: "https://picsum.photos/seed/video1/400/225", hint: "beach drone" },
  { id: 2, title: "Cooking Tutorial: Pasta", duration: "12:30", thumbnail: "https://picsum.photos/seed/video2/400/225", hint: "cooking pasta" },
  { id: 3, title: "City Tour by Night", duration: "5:12", thumbnail: "https://picsum.photos/seed/video3/400/225", hint: "city night" },
  { id: 4, title: "Workout Routine", duration: "25:00", thumbnail: "https://picsum.photos/seed/video4/400/225", hint: "person exercising" },
]

export default function VideosPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Videos</h1>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Video</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <Card key={video.id} className="group relative overflow-hidden">
             <CardHeader className="p-0">
              <div className="relative">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  data-ai-hint={video.hint}
                  width={400}
                  height={225}
                  className="aspect-video w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-16 w-16 text-white/80" />
                </div>
                 <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-sm">
                  {video.duration}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{video.title}</h3>
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
    </>
  )
}
