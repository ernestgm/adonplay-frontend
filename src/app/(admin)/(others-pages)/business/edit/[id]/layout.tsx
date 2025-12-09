import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Edit Business | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Edit Business Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function EditBusinessLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

