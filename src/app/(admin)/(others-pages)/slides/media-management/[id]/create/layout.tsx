import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Create Slide Media | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Create Slide Media Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function CreateSlideMediaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}