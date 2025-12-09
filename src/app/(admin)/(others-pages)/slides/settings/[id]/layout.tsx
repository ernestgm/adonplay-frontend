import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Setting Slide | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
    description: `This is Setting Slide Page in ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function SettingSlideLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

