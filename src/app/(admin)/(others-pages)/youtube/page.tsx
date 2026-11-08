import React from "react";
import {generatePageMetadata} from "@/i18n/metadata";
import YoutubeSourcesPageContent from "@/components/pages/YoutubeSourcesPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.youtubeSources");
}

export default function YoutubeSourcesPage() {
  return <YoutubeSourcesPageContent />;
}
