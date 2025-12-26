import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import SlidesPageContent from "@/components/pages/SlidesPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.slides");
}

export default function SlidesPage() {
  return <SlidesPageContent/>;
}

