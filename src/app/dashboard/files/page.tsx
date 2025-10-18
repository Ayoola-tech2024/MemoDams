
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
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface File {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
}

const placeholderFiles: File[] = [
    { id: '1', name: 'Project Proposal Q3.pdf', fileType: 'application/pdf', fileSize: 1258291, uploadDate: new Date('2023-10-26T10:00:00Z') },
    { id: '2', name: 'Marketing-Assets.zip', fileType: 'application/zip', fileSize: 24117248, uploadDate: new Date('2023-10-25T15:30:00Z') },
    { id: '3', name: 'Website_Copy_Final.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileSize: 89341, uploadDate: new Date('2023-10-25T11:45:00Z') },
    { id: '4', name: 'Sound-Design-Theme.mp3', fileType: 'audio/mpeg', fileSize: 3145728, uploadDate: new Date('2023-10-24T09:00:00Z') },
    { id: '5', name: 'Brand_Guidelines_2023.ai', fileType: 'application/postscript', fileSize: 5242880, uploadDate: new Date('2023-10-23T14:20:00Z') },
];


const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (type.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-500" />;
  if (type.startsWith('audio/')) return <FileAudio className="h-5 w-5 text-orange-500" />;
  if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (type === 'application/zip') return <FileArchive className="h-5 w-5 text-yellow-500" />;
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


export default function FilesPage() {

  const files = placeholderFiles;
  const isLoading = false;

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold md:text-3xl">Files</h1>
         <Tooltip>
            <TooltipTrigger asChild>
                 <Button size="sm" className="h-8 gap-1" disabled>
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload File</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>File upload feature coming soon!</p>
            </TooltipContent>
         </Tooltip>
      </div>

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
                      {file.uploadDate ? format(file.uploadDate, "PPp") : 'No date'}
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
                           <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuItem disabled>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </DropdownMenuItem>
                            </TooltipTrigger>
                             <TooltipContent side="left"><p>Feature coming soon!</p></TooltipContent>
                           </Tooltip>
                           <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuItem disabled>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Rename
                                </DropdownMenuItem>
                            </TooltipTrigger>
                             <TooltipContent side="left"><p>Feature coming soon!</p></TooltipContent>
                           </Tooltip>
                           <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuItem disabled className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </TooltipTrigger>
                             <TooltipContent side="left"><p>Feature coming soon!</p></TooltipContent>
                           </Tooltip>
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
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button className="mt-4" disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                </TooltipTrigger>
                 <TooltipContent><p>File upload feature coming soon!</p></TooltipContent>
             </Tooltip>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
