"use client";

import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ErrorProvider } from "@/context/ErrorContext";
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
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
      <Suspense fallback={<div>Loading...</div>}>
        <ThemeProvider>
          <GlobalLoadingIndicator/>
          <SidebarProvider>
            <ErrorProvider>{children}</ErrorProvider>
          </SidebarProvider>
        </ThemeProvider>
      </Suspense>
      </body>
    </html>
  );
}
