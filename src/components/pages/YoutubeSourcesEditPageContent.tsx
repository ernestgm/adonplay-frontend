"use client";

import React, {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import YoutubeSourceForm from "@/components/app/youtube/form/YoutubeSourceForm";
import {getYoutubeSource} from "@/server/api/youtubeSources";
import {useError} from "@/context/ErrorContext";
import {useT} from "@/i18n/I18nProvider";

export default function YoutubeSourcesEditPageContent() {
  const {id} = useParams();
  const router = useRouter();
  const setError = useError().setError;
  const t = useT("pages.youtubeSources");
  const tStates = useT("common.table.states");
  const [source, setSource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getYoutubeSource(id as string)
      .then(setSource)
      .catch((err: any) => setError(err.data?.message || err.message || t("errors.load")))
      .finally(() => setLoading(false));
  }, [id, setError]);

  if (loading) return <div>{tStates("loading")}</div>;
  return <div><PageBreadcrumb pageTitle={t("editPageTitle")} onBack={() => router.push("/youtube")} /><YoutubeSourceForm source={source} /></div>;
}
