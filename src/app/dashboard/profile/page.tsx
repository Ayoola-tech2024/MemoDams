import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://picsum.photos/seed/user-avatar/80/80" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Button>Change Photo</Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" defaultValue="Ayoola Damisile" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="ayoola@example.com" readOnly />
               <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a little about yourself"
                defaultValue="Building the future, one line of code at a time."
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Update your password here. It's a good practice to use a strong, unique password.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Update Password</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
