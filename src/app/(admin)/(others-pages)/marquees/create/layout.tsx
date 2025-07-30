import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Create Marquee | ${process.env.NAME_PAGE}`,
    description: `This is Create Marquee Page in ${process.env.NAME_PAGE}`,
};

export default function CreateMarqueeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

