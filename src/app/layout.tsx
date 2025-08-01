"use client";

import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ErrorProvider } from "@/context/ErrorContext";
import React from "react";
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
        <ThemeProvider>
          <GlobalLoadingIndicator/>
          <SidebarProvider>
            <ErrorProvider>{children}</ErrorProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
