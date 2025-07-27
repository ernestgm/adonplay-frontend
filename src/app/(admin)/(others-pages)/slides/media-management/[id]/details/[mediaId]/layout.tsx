import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Slide Media Details | ${process.env.NAME_PAGE}`,
    description: `This is Slide Media Details Page in ${process.env.NAME_PAGE}`,
};

export default function SlideMediaDetailsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}