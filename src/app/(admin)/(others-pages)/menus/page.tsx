import React from "react";
import type { Metadata } from "next";
import FormMenuPageContent from "@/components/pages/FormMenuPageContent";

export const metadata: Metadata = {
  title: `formmenu | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
  description: `Administra formmenu de ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
};

export default function FormMenuPage() {
  return <FormMenuPageContent />;
}
