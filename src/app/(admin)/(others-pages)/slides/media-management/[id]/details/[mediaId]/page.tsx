import React from "react";
import { generatePageMetadata } from "@/i18n/metadata";
import SlidesMediaDetailsPageContent from "@/components/pages/SlidesMediaDetailsPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.slides");
}

export default function SlideMediaDetailsPage({ params }: { params: { id: string; mediaId: string } }) {
  return <SlidesMediaDetailsPageContent slideId={params.id} mediaId={params.mediaId} />;
}