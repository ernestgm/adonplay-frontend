"use client";

import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ErrorProvider } from "@/context/ErrorContext";
import { I18nProvider } from "@/i18n/I18nProvider";
import React, {Suspense, useEffect} from "react";
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

  // Register Service Worker for media caching
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    console.log('Registering SW...');
    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', {scope: '/'});
      } catch (e) {
        console.warn('SW registration failed', e);
      }
    };
    // Delay registration until app idle to avoid competing with critical resources
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(register);
    } else {
      setTimeout(register, 0);
    }
  }, [])

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
