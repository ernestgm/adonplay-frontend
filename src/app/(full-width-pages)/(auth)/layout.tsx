import GridShape from "@/components/common/GridShape";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Image
                    className="dark:hidden"
                    src="/images/logo/logo-notext.png"
                    alt="Logo"
                    width={250}
                    height={250}
                />
                <h1 className="mb-2 font-semibold text-white text-title-sm dark:text-white/90 sm:text-title-md">{ process.env.NEXT_PUBLIC_NAME_PAGE }</h1>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
