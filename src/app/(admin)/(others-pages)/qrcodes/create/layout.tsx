import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Create Qr | ${process.env.NAME_PAGE}`,
    description: `This is Create Qr Page in ${process.env.NAME_PAGE}`,
};

export default function CreateQrLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}