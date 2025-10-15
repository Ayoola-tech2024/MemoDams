
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'MemoDams - Secure Cloud Storage for Notes, Photos, and Files',
  description: 'MemoDams is your all-in-one digital vault. Securely store, organize, and access your notes, photos, videos, and important files from anywhere. Privacy first, cloud-powered.',
  keywords: ['cloud storage', 'note taking', 'photo storage', 'file management', 'secure notes', 'digital diary', 'firebase'],
  authors: [{ name: 'Ayoola Damisile' }],
  creator: 'Ayoola Damisile',
  openGraph: {
    title: 'MemoDams - Your Digital Life, Secured',
    description: 'The all-in-one app to securely manage notes, photos, videos, and files. Your personal cloud-powered digital space.',
    type: 'website',
    url: 'https://memodams.vercel.app', // Replace with your actual domain
    images: [
      {
        url: 'https://memodams.vercel.app/og-image.png', // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: 'MemoDams Application Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemoDams - Secure Cloud Storage for Your Digital Life',
    description: 'From fleeting ideas to important documents, MemoDams keeps your digital life organized and secure in the cloud.',
    images: ['https://memodams.vercel.app/twitter-image.png'], // Replace with your actual Twitter image URL
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
