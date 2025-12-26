import React from 'react';
import { generatePageMetadata } from "@/i18n/metadata";
import MediaCreatePageContent from "@/components/pages/MediaCreatePageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.mediaLibrary");
}

export default function MediaCreatePage() {
  return <MediaCreatePageContent/>;
}

