import React from "react";
import type { Metadata } from "next";
import EditMenuPageContent from "@/components/pages/EditMenuPageContent";

export const metadata: Metadata = {
  title: `Editar formmenu | ${process.env.NEXT_PUBLIC_NAME_PAGE}`,
  description: "Edita el diseño y los productos de un formmenu.",
};

export default function EditMenuPage() {
  return <EditMenuPageContent />;
}
