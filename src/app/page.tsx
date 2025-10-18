
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Box, FileText, Cloud, Lock, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';

const features = [
  {
    icon: <Box className="h-10 w-10 text-accent" />,
    title: 'All-in-One Storage',
    description: 'Keep your notes, photos, videos, and files all together in one secure online space.',
  },
  {
    icon: <FileText className="h-10 w-10 text-accent" />,
    title: 'Your Digital Diary',
    description: 'Capture your thoughts and ideas anytime, anywhere, and keep them beautifully organized.',
  },
  {
    icon: <Cloud className="h-10 w-10 text-accent" />,
    title: 'Cloud-Powered Access',
    description: 'Access your dashboard and memories from any device, anywhere in the world — securely synced online.',
  },
  {
    icon: <Lock className="h-10 w-10 text-accent" />,
    title: 'Privacy First',
    description: 'Your data belongs to you. Every file, note, and photo stays private and protected with Firebase security.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col text-center">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative flex h-[calc(100vh-3.5rem)] items-center justify-center py-20 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 top-0 z-0 grid grid-cols-2 -space-x-52 opacity-20"
          >
            <div className="h-60 bg-gradient-to-br from-primary to-purple-400 blur-3xl dark:h-96 animate-float"></div>
            <div className="h-60 bg-gradient-to-r from-accent to-cyan-400 blur-3xl dark:h-96 animate-float" style={{ animationDelay: '3s' }}></div>
          </div>
          <div className="container relative z-10 flex flex-col items-center">
            <div className="mb-8">
              <Logo showText={false} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Your notes, memories, and files,
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                all in one secure place.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              MemoDams provides a secure and beautiful space to capture your life's moments.
              Store everything from fleeting ideas to important documents with powerful cloud technology.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted/30 py-20 md:py-28 px-4">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Everything You Need, All in One App</h2>
              <p className="mt-4 text-muted-foreground">
                MemoDams is more than just storage. It's a suite of tools designed to help you organize your digital life effortlessly.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <Card key={i} className="transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
                  <CardHeader className="items-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

         <section className="py-16">
          <div className="container text-center">
             <h2 className="text-3xl font-bold md:text-4xl">Ready to Secure Your Digital Life?</h2>
             <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Join thousands of users who trust MemoDams to keep their notes, memories, and files safe.
                Sign up today and experience the peace of mind that comes with a secure, all-in-one digital vault.
            </p>
            <div className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/signup">
                        Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 text-center md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
            <Logo />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © 2025 MemoDams. Built by Ayoola Damisile.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">Login</Link>
            <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
            <Link href="#" className="hover:text-foreground">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
