import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Edit Slide Media | ${process.env.NAME_PAGE}`,
    description: `This is Edit Slide Media Page in ${process.env.NAME_PAGE}`,
};

export default function EditSlideMediaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}