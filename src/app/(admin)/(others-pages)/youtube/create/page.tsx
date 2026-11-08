import React from "react";
import {generatePageMetadata} from "@/i18n/metadata";
import YoutubeSourcesCreatePageContent from "@/components/pages/YoutubeSourcesCreatePageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.youtubeSources");
}

export default function YoutubeSourcesCreatePage() {
  return <YoutubeSourcesCreatePageContent />;
}
