import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import SlidesMediaCreatePageContent from "@/components/pages/SlidesMediaCreatePageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.slides");
}

export default function SlideMediaCreatePage() {
  return <SlidesMediaCreatePageContent />;
}