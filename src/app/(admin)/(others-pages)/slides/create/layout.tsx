import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Create Slide | ${process.env.NAME_PAGE}`,
    description: `This is Create Slide Page in ${process.env.NAME_PAGE}`,
};

export default function CreateSlideLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}