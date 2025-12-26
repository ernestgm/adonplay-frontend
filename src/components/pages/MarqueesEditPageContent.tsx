"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useError } from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import MarqueesForm from "@/components/app/marquees/form/MarqueesForm";
import { getMarquees } from "@/server/api/marquees";
import { useT } from "@/i18n/I18nProvider";

const MarqueesEditPageContent = () => {
    const params = useParams();
    const id = params.id;
  const setError = useError().setError;
  const [loading, setLoading] = useState(true);
  const [marquee, setMarquee] = useState<any>(null);
  const router = useRouter();

  const tStates = useT("common.table.states");
  const tPage = useT("pages.marquees");

  const handleBack = () => {
    router.push(`/marquees`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getMarquees(id);
        setMarquee(data);
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
      <MarqueesForm marquee={marquee} />
    </div>
  );
};

export default MarqueesEditPageContent;
