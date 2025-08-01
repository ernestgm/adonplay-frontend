"use client"

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import ActivateDeviceForm from "@/components/user-profile/ActivateDeviceForm";
import {useParams} from "next/navigation";

export default function DevicesPage() {
    const params = useParams();
    const id = params.id; // El ID de la URL
  return (
      <div>
          <PageBreadcrumb pageTitle="Activate Devices" />
          <div className="space-y-6">
              <ComponentCard title="Devices">
                  <ActivateDeviceForm userId={id}/>
              </ComponentCard>
          </div>
      </div>
  );
}
