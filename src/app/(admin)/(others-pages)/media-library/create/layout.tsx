import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Create Media | ${process.env.NAME_PAGE}`,
    description: `This is Create Media Page in ${process.env.NAME_PAGE}`,
};

export default function CreateMediaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

