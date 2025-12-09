import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Edit Media | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Edit Media Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function EditQrCodeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

