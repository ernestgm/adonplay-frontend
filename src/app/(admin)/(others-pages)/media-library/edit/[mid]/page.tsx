import React from 'react';
import { generatePageMetadata } from "@/i18n/metadata";
import MediaEditPageContent from "@/components/pages/MediaEditPageContent";

export async function generateMetadata() {
  return generatePageMetadata("pages.mediaLibrary");
}

export default function MediaEditPage({ params }: { params: { mid: string } }) {
  return <MediaEditPageContent id={params.mid} />;
}

