import React from "react";
import {generatePageMetadata} from "@/i18n/metadata";
import YoutubeSourcesEditPageContent from "@/components/pages/YoutubeSourcesEditPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.youtubeSources");
}

export default function YoutubeSourcesEditPage() {
  return <YoutubeSourcesEditPageContent />;
}
