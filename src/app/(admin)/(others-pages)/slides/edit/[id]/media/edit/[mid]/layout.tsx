import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Edit Qr Code | ${process.env.NAME_PAGE}`,
    description: `This is Edit Qr COde Page in ${process.env.NAME_PAGE}`,
};

export default function EditQrCodeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

