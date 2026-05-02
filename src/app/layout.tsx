import type { Metadata } from "next";
import "./globals.css";
import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from '@vercel/analytics/next';

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
  const locale = await getLocale();
  return (
    <html lang={locale}>
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
        <Analytics />
      </body>
    </html>
  );
}
