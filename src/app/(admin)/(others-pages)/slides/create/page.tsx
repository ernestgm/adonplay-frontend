import React from 'react';
import { generatePageMetadata } from '@/i18n/metadata';
import CreateSlidePageContent from '@/components/pages/CreateSlidePageContent';

export async function generateMetadata() {
  return generatePageMetadata('pages.slides');
}

export default function SlideCreatePage() {
  return <CreateSlidePageContent/>;
}

