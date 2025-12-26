"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useError } from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import { getQrCode } from "@/server/api/qrcodes";
import QrCodeForm from "@/components/app/qrcodes/form/QrCodeForm";
import { useT } from "@/i18n/I18nProvider";

const QrCodesEditPageContent = () => {
    const params = useParams();
    const id = params.id;
  const setError = useError().setError;
  const [loading, setLoading] = useState(true);
  const [qrcode, setQrCode] = useState<any>(null);
  const router = useRouter();

  const tStates = useT("common.table.states");
  const tPage = useT("pages.qrcodes");

  const handleBack = () => {
    router.push(`/qrcodes`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getQrCode(id);
        setQrCode(data);
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
      <QrCodeForm qrcode={qrcode} />
    </div>
  );
};

export default QrCodesEditPageContent;
