import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Viewport } from 'next'
import Link from "next/link";
import Image from "next/image";
import { ModalStackContainer } from "rc-modal-sheet";
import { motion } from "motion/react";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn Languages",
  description: "A Website to Learn Languages",
};

function MyLink(
  { href, label }: { href: string, label: string }
) {
  return (
    <Link className="font-bold" href={href}>{label}</Link>
  )
}
function Navbar() {
  return (
    <div className="flex justify-between items-center w-full h-16 px-8 bg-[#35786f] text-white">
      <Link href={'/'} className="text-xl flex">
        <Image
          src={'/favicon.ico'}
          alt="logo"
          width="32"
          height="32"
          className="rounded-4xl">
        </Image>
        <span className="font-bold">学语言</span>
      </Link>
      <div className="flex gap-4 text-xl">
        <MyLink href="/changelog.txt" label="关于"></MyLink>
        <MyLink href="https://github.com/GoddoNebianU/learn-languages" label="源码"></MyLink>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar></Navbar>
        {children}
      </body>
    </html>
  );
}
