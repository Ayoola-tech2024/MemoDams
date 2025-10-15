import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, ListFilter } from "lucide-react"
import Link from 'next/link'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const notes = [
  {
    title: "Project MemoDam Launch",
    date: "October 26, 2024",
    content: "Final preparations for the big day. Need to double-check the deployment script and prepare the announcement post. The marketing team needs the final assets by EOD.",
    tags: ["work", "project-x"],
  },
  {
    title: "Grocery List",
    date: "October 25, 2024",
    content: "Milk, Bread, Coffee beans (dark roast), avocados, chicken breast, and that one snack I always forget the name of.",
    tags: ["personal", "home"],
  },
  {
    title: "Ideas for new feature",
    date: "October 24, 2024",
    content: "What if we could integrate a calendar view for notes? Users could attach notes to specific dates. This would be great for journaling or planning.",
    tags: ["idea", "feature"],
  },
  {
    title: "Book Recommendations",
    date: "October 22, 2024",
    content: "1. 'Project Hail Mary' by Andy Weir. 2. 'The Midnight Library' by Matt Haig. 3. 'Klara and the Sun' by Kazuo Ishiguro. All are fantastic reads.",
    tags: ["reading", "personal"],
  },
  {
    title: "Meeting Notes - Q4 Planning",
    date: "October 20, 2024",
    content: "Key takeaways: Focus on user retention for Q4. The main KPI will be monthly active users. New marketing campaign to launch mid-November.",
    tags: ["work", "meeting"],
  },
    {
    title: "Vacation Plans",
    date: "October 18, 2024",
    content: "Research flights to Kyoto for spring. Look into traditional ryokans and book a tea ceremony experience. Need to renew my passport.",
    tags: ["travel", "personal"],
  },
]

export default function NotesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Notes</h1>
        <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Work</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Personal</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Idea</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Create Note</span>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {notes.map((note, index) => (
          <Card key={index} className="flex flex-col transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
              <CardDescription>{note.date}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="line-clamp-4 text-sm text-muted-foreground">{note.content}</p>
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}
