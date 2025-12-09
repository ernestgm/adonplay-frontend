import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Create Qr | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Create Qr Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function CreateQrLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}