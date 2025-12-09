import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Edit Slide Media | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Edit Slide Media Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function EditSlideMediaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}