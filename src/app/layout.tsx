import type { Metadata } from "next";
import "./globals.css";
import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: "Learn Languages",
  description: "A Website to Learn Languages",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <NextIntlClientProvider>
          <Navbar></Navbar>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
