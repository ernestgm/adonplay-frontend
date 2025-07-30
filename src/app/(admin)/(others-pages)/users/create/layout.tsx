import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Create User | ${process.env.NAME_PAGE}`,
    description: `This is Create User Page in ${process.env.NAME_PAGE}`,
};

export default function CreateUserLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}