"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useError } from "@/context/ErrorContext";
import { useRouter } from "next/navigation";
import { getUser } from "@/server/api/users";
import UserForm from "@/components/app/user/form/UserForm";
import { useT } from "@/i18n/I18nProvider";

const UsersEditPageContent: React.FC<{ id: string }> = ({ id }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const setError = useError().setError;

  const tStates = useT("common.table.states");
  const tPage = useT("pages.users");

  const router = useRouter();
  const handleBack = () => {
    router.push(`/users`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getUser(id);
        setUser(data);
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
      <UserForm user={user} />
    </div>
  );
};

export default UsersEditPageContent;
