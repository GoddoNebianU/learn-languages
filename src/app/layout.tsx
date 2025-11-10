import type { Metadata } from "next";
import "./globals.css";
import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import SessionWrapper from "@/lib/SessionWrapper";
import { Navbar } from "@/components/Navbar";

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
    <SessionWrapper>
      <html lang="en">
        <body className={`antialiased`}>
          <NextIntlClientProvider>
            <Navbar></Navbar>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </SessionWrapper>
  );
}
