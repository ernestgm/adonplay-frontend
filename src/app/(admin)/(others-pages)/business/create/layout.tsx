import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Create Business | ${process.env.NAME_PAGE}`,
    description: `This is Create Business Page in ${process.env.NAME_PAGE}`,
};

export default function CreateBusinessLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

