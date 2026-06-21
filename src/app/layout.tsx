import type { Metadata } from "next";
import "./globals.css";
import type { Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { DensityProvider } from "@/components/density-provider";
import { Analytics } from '@vercel/analytics/next';
import { getCapabilities } from "@/lib/capability";
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
  const capabilities = await getCapabilities();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`antialiased`}>
        <script dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var d=localStorage.getItem('density-mode');if(d!=='comfortable')document.documentElement.dataset.density='compact';}catch(e){document.documentElement.dataset.density='compact';}})();",
        }} />
        <StrictMode>
          <ThemeProvider>
            <DensityProvider>
              <NextIntlClientProvider>
                <CapabilityHydrator capabilities={capabilities}>
                  <Navbar />
                  <main className="bg-primary-500 min-h-[var(--page-min-h)]">{children}</main>
                  <Toaster />
                </CapabilityHydrator>
              </NextIntlClientProvider>
            </DensityProvider>
          </ThemeProvider>
        </StrictMode>
        <Analytics />
      </body>
    </html>
  );
}
