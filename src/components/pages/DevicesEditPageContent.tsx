"use client";

import React, { useEffect, useState } from "react";
import { useError } from "@/context/ErrorContext";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { getDevice } from "@/server/api/devices";
import DeviceForm from "@/components/app/devices/form/DeviceForm";
import { useT } from "@/i18n/I18nProvider";

const DevicesEditPageContent: React.FC<{ id: string }> = ({ id }) => {
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const setError = useError().setError;

  const tStates = useT("common.table.states");
  const tPage = useT("pages.devices");

  const router = useRouter();
  const handleBack = () => {
    router.push(`/devices`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getDevice(id);
        setDevice(data);
      } catch (err: any) {
        setError(err.data?.message || err.message || "Error Fetch Data. Check your network or server conection");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setError]);

  if (loading) {
    return <div>{tStates("loading")}</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={tPage("editPageTitle")} onBack={handleBack} />
      <DeviceForm device={device} />
    </div>
  );
};

export default DevicesEditPageContent;
