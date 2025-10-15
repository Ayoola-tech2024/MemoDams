import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, MoreVertical, Download, Trash2, Pencil } from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const photos = [
  { id: 1, src: "https://picsum.photos/seed/memodams1/400/300", alt: "Mountain landscape", hint: "mountain landscape" },
  { id: 2, src: "https://picsum.photos/seed/memodams2/400/300", alt: "City skyline at night", hint: "city night" },
  { id: 3, src: "https://picsum.photos/seed/memodams3/400/300", alt: "Abstract painting", hint: "abstract art" },
  { id: 4, src: "https://picsum.photos/seed/memodams4/400/300", alt: "Close up of a flower", hint: "flower closeup" },
  { id: 5, src: "https://picsum.photos/seed/memodams5/400/300", alt: "A sandy beach", hint: "sandy beach" },
  { id: 6, src: "https://picsum.photos/seed/memodams6/400/300", alt: "A dense forest", hint: "dense forest" },
  { id: 7, src: "https://picsum.photos/seed/memodams7/400/300", alt: "A cup of coffee", hint: "coffee cup" },
  { id: 8, src: "https://picsum.photos/seed/memodams8/400/300", alt: "A cute cat", hint: "cute cat" },
]

export default function PhotosPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Photos</h1>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Photo</span>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {photos.map((photo) => (
          <Card key={photo.id} className="group relative overflow-hidden">
            <CardContent className="p-0">
              <Image
                src={photo.src}
                alt={photo.alt}
                data-ai-hint={photo.hint}
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
    </>
  )
}
