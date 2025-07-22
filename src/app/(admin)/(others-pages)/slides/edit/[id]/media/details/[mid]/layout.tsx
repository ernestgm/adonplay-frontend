import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Media Details | ${process.env.NAME_PAGE}`,
    description: `This is Media Details Page in ${process.env.NAME_PAGE}`,
};

export default function MediaDetailsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}