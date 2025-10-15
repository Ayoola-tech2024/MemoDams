
"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop, User, Trash2 } from "lucide-react"
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";


export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast();

  const handleDeleteAccount = () => {
    // This is a placeholder. In a real app, you would have a complex flow
    // for account deletion, including re-authentication and data cleanup.
    toast({
      variant: "destructive",
      title: "Account Deletion Requested",
      description: "This feature is not yet implemented. In a real application, this would permanently delete your account and all associated data.",
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Preferences</CardTitle>
            <CardDescription>
              Choose how you want to experience MemoDams.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={theme}
              onValueChange={setTheme}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <Label htmlFor="theme-light" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                <Sun className="mb-3 h-6 w-6" />
                Light
              </Label>
              <Label htmlFor="theme-dark" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                <Moon className="mb-3 h-6 w-6" />
                Dark
              </Label>
              <Label htmlFor="theme-system" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                <Laptop className="mb-3 h-6 w-6" />
                System
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account and personal information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Update your name, bio, and password on your profile page.
            </p>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <Button asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Go to Profile
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              These actions are permanent and cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove all your data, including notes, files, and personal settings.
            </p>
          </CardContent>
          <CardFooter className="border-t border-destructive/50 px-6 py-4">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
