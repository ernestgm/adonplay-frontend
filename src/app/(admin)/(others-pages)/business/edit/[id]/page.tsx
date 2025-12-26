import React from 'react';
import { generatePageMetadata } from '@/i18n/metadata';
import BusinessEditPageContent from '@/components/pages/BusinessEditPageContent';

export async function generateMetadata() {
  return generatePageMetadata('pages.business');
}

export default function BusinessEditPage({ params }: { params: { id: string } }) {
  return <BusinessEditPageContent id={params.id} />;
}

