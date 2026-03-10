import type { Metadata } from "next";
import "./globals.css";
import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

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
        <StrictMode>
          <ThemeProvider>
            <NextIntlClientProvider>
              <Navbar></Navbar>
              {children}
              <Toaster />
            </NextIntlClientProvider>
          </ThemeProvider>
        </StrictMode>
      </body>
    </html>
  );
}
