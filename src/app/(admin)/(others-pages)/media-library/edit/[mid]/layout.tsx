import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Edit Media | ${process.env.NAME_PAGE}`,
    description: `This is Edit Media Page in ${process.env.NAME_PAGE}`,
};

export default function EditQrCodeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

