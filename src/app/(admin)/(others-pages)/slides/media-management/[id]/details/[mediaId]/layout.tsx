import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Slide Media Details | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Slide Media Details Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function SlideMediaDetailsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}