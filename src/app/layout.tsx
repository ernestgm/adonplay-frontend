"use client";

import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ErrorProvider } from "@/context/ErrorContext";
import { I18nProvider } from "@/i18n/I18nProvider";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import React, {Suspense} from "react";
import GlobalLoadingIndicator from "@/components/ui/loading/globalLoadingIndicator";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Try to read initial locale from cookie to minimize flicker
  let initialLocale = "en";
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    initialLocale = match ? decodeURIComponent(match[1]) : "en";
  }
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
      <Suspense fallback={<div>Loading...</div>}>
        <I18nProvider defaultLocale={initialLocale}>
          <ThemeProvider>
            <GlobalLoadingIndicator/>
            <SidebarProvider>
              <ErrorProvider>{children}</ErrorProvider>
            </SidebarProvider>
          </ThemeProvider>
        </I18nProvider>
      </Suspense>
      </body>
    </html>
  );
}
