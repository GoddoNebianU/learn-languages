import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceHanSansSC = localFont({
  src: [
    {
      path: '../../public/fonts/SourceHanSansSC-ExtraLight.otf',
      weight: '200',
      style: 'normal'
    },
    {
      path: '../../public/fonts/SourceHanSansSC-Light.otf',
      weight: '300',
      style: 'normal'
    },
    {
      path: '../../public/fonts/SourceHanSansSC-Regular.otf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../public/fonts/SourceHanSansSC-Medium.otf',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../../public/fonts/SourceHanSansSC-Bold.otf',
      weight: '700',
      style: 'normal'
    },
    {
      path: '../../public/fonts/SourceHanSansSC-Heavy.otf',
      weight: '900',
      style: 'normal'
    }
  ]
});

export const metadata: Metadata = {
  title: "Learn Languages",
  description: "A Website to Learn Languages",
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sourceHanSansSC.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
