import React from 'react';
import { generatePageMetadata } from '@/i18n/metadata';
import BusinessCreatePageContent from '@/components/pages/BusinessCreatePageContent';

export async function generateMetadata() {
  return generatePageMetadata('pages.business');
}

export default function BusinessCreatePage() {
  return <BusinessCreatePageContent/>;
}

