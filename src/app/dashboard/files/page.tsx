import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  File,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  PlusCircle,
  MoreHorizontal,
  Folder,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const files = [
  { name: "annual-report-2024.pdf", type: "pdf", size: "2.3 MB", modified: "2 days ago" },
  { name: "project-logo.png", type: "image", size: "128 KB", modified: "3 days ago" },
  { name: "meeting-recording.mp3", type: "audio", size: "15.8 MB", modified: "5 days ago" },
  { name: "requirements.docx", type: "doc", size: "512 KB", modified: "1 week ago" },
  { name: "promo-video-final.mp4", type: "video", size: "78.2 MB", modified: "2 weeks ago" },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
    case 'image': return <FileImage className="h-5 w-5 text-blue-500" />;
    case 'audio': return <FileAudio className="h-5 w-5 text-orange-500" />;
    case 'video': return <FileVideo className="h-5 w-5 text-purple-500" />;
    default: return <File className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function FilesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Files</h1>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload File</span>
        </Button>
      </div>
       <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <span>{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{file.size}</TableCell>
                  <TableCell className="hidden md:table-cell">{file.modified}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Move</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
