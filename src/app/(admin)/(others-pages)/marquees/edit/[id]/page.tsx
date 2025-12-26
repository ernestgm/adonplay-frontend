import React from 'react';
import { generatePageMetadata } from '@/i18n/metadata';
import MarqueesEditPageContent from '@/components/pages/MarqueesEditPageContent';

export async function generateMetadata() {
  return generatePageMetadata('pages.marquees');
}

export default function MarqueesEditPage() {
  return <MarqueesEditPageContent />;
}

