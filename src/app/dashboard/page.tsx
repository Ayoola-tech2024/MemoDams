import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookText, FileArchive, Image as ImageIcon, Video, ArrowRight } from "lucide-react"
import Link from 'next/link'

const overviewItems = [
  { title: "Notes", count: 12, icon: BookText, href: "/dashboard/notes" },
  { title: "Photos", count: 87, icon: ImageIcon, href: "/dashboard/photos" },
  { title: "Videos", count: 8, icon: Video, href: "/dashboard/videos" },
  { title: "Files", count: 23, icon: FileArchive, href: "/dashboard/files" },
]

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back, Ayoola!
          </h1>
          <p className="text-muted-foreground">
            Here's a quick overview of your digital world.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
              <Link href={item.href} className="text-xs text-muted-foreground flex items-center hover:text-primary">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>
              A glimpse of your latest thoughts and ideas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent notes list */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">Project MemoDam Launch</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">Final preparations for the big day...</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#">View</Link>
                </Button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">Grocery List</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">Milk, Bread, Coffee, and that one thing I always forget.</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#">View</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>
              Your latest photos, videos, and files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent uploads */}
             <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-secondary p-3">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">vacation_photo_01.jpg</p>
                  <p className="text-sm text-muted-foreground">Uploaded 2 hours ago</p>
                </div>
              </div>
               <div className="flex items-center gap-4">
                <div className="rounded-md bg-secondary p-3">
                  <FileArchive className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">annual_report.pdf</p>
                  <p className="text-sm text-muted-foreground">Uploaded yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
