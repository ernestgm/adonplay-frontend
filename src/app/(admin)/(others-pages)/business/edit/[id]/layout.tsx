import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Edit Business | ${process.env.NAME_PAGE}`,
    description: `This is Edit Business Page in ${process.env.NAME_PAGE}`,
};

export default function EditBusinessLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

