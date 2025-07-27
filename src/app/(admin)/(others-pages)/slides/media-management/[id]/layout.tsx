import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Slide Media Management | ${process.env.NAME_PAGE}`,
    description: `This is Slide Media Management Page in ${process.env.NAME_PAGE}`,
};

export default function EditBusinessLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

