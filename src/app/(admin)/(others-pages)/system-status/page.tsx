import React from "react";
import SystemStatusPageContent from "@/components/pages/SystemStatusPageContent";

export const metadata = {
    title: "Estado del sistema | AdOnPlay",
    description: "Estado de contenedores, carga del servidor y certificados SSL.",
};

export default function SystemStatusPage() {
    return <SystemStatusPageContent/>;
}
