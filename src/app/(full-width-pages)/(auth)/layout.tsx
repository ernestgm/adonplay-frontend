import GridShape from "@/components/common/GridShape";

import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-surface-page z-1 sm:p-0">
      <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col sm:p-0">
        {children}
        <div className="lg:w-1/2 w-full h-full bg-brand-950 lg:grid items-center hidden">
          <div className="relative items-center justify-center  flex z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Image
                  src="/images/logo/logo-notext.png"
                  alt="Logo"
                  width={250}
                  height={250}
              />
              <h1 className="mb-2 font-semibold text-white text-title-sm sm:text-title-md">{ process.env.NEXT_PUBLIC_NAME_PAGE }</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
