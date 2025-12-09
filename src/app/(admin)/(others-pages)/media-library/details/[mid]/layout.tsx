import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Media Details | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Media Details Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function MediaDetailsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}