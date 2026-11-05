import { Outfit } from "next/font/google";
import "./globals.css";

import { cookies } from "next/headers";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ErrorProvider } from "@/context/ErrorContext";
import { I18nProvider } from "@/i18n/I18nProvider";
import React, { Suspense } from "react";
import GlobalLoadingIndicator from "@/components/ui/loading/globalLoadingIndicator";
import ServiceWorkerRegister from "@/components/common/ServiceWorkerRegister";

const outfit = Outfit({
  subsets: ["latin"],
});

// Applied before first paint to avoid a flash of the wrong theme.
// Must mirror the ThemeProvider initializer exactly (localStorage → system).
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);var c=document.documentElement.classList;if(d){c.add("dark")}else{c.remove("dark")}document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read initial locale server-side to avoid a client-side flash
  let initialLocale = "en";
  try {
    const cookieStore = await cookies();
    initialLocale = cookieStore.get("locale")?.value || "en";
  } catch {
    // cookies() unavailable (e.g. static generation) — fall back to "en"
  }

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${outfit.className} bg-surface-page text-content-primary antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <I18nProvider defaultLocale={initialLocale}>
            <ThemeProvider>
              <GlobalLoadingIndicator />
              <SidebarProvider>
                <ErrorProvider>{children}</ErrorProvider>
              </SidebarProvider>
              <ServiceWorkerRegister />
            </ThemeProvider>
          </I18nProvider>
        </Suspense>
      </body>
    </html>
  );
}
