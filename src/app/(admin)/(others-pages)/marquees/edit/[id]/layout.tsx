import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Edit Marquees | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Edit Marquees Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function EditMarqueesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

