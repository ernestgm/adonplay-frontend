import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Create Slide Media | ${process.env.NAME_PAGE}`,
    description: `This is Create Slide Media Page in ${process.env.NAME_PAGE}`,
};

export default function CreateSlideMediaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}