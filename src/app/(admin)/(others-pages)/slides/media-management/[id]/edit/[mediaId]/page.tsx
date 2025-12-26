import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import SlidesMediaEditPageContent from "@/components/pages/SlidesMediaEditPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.slides");
}

export default function SlideMediaEditPage({ params }: { params: { id: string; mediaId: string } }) {
  return <SlidesMediaEditPageContent slideId={params.id} mediaId={params.mediaId} />;
}