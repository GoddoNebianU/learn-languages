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
import { getCapabilities, getTier } from "@/lib/capability";
import { CapabilityHydrator } from "@/components/capability-hydrator";

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
  const tier = await getTier();
  const capabilities = await getCapabilities();

  return (
    <html lang={locale}>
      <body className={`antialiased`}>
        <StrictMode>
          <ThemeProvider>
            <NextIntlClientProvider>
              <CapabilityHydrator tier={tier} capabilities={capabilities}>
                <Navbar />
                {children}
                <Toaster />
              </CapabilityHydrator>
            </NextIntlClientProvider>
          </ThemeProvider>
        </StrictMode>
        <Analytics />
      </body>
    </html>
  );
}
