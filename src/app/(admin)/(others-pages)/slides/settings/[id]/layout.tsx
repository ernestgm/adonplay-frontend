import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: `Setting Slide | ${process.env.NAME_PAGE}`,
    description: `This is Setting Slide Page in ${process.env.NAME_PAGE}`,
};

export default function SettingSlideLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

