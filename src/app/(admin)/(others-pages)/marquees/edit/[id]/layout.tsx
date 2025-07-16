import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Edit Marquees | ${process.env.NAME_PAGE}`,
    description: `This is Edit Marquees Page in ${process.env.NAME_PAGE}`,
};

export default function EditMarqueesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

