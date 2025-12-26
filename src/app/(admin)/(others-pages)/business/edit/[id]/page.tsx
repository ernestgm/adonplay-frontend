import React from 'react';
import { generatePageMetadata } from '@/i18n/metadata';
import BusinessEditPageContent from '@/components/pages/BusinessEditPageContent';

export async function generateMetadata() {
  return generatePageMetadata('pages.business');
}

export default function BusinessEditPage() {
  return <BusinessEditPageContent />;
}

