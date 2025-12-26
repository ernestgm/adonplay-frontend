import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import MarqueesCreatePageContent from "@/components/pages/MarqueesCreatePageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.marquees");
}

export default function MarqueeCreatePage() {
  return <MarqueesCreatePageContent/>;
}
