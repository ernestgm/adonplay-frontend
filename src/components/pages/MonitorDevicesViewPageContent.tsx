"use client";

import React, {useEffect, useState} from "react";
import {useError} from "@/context/ErrorContext";
import {useParams, useRouter} from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {getDevice} from "@/server/api/devices";
import {useT} from "@/i18n/I18nProvider";
import MonitorDeviceView from "@/components/app/devices/view/MonitorDeviceView";

const MonitorDevicesViewPageContent = () => {
    const params = useParams();
    const id = params.id;
    const [device, setDevice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const setError = useError().setError;

    const tStates = useT("common.table.states");
    const tPage = useT("pages.monitorDevices");

    const router = useRouter();
    const handleBack = () => {
        router.push(`/monitor-devices`);
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
            <PageBreadcrumb pageTitle={tPage("viewPageTitle")} onBack={handleBack}/>
            <MonitorDeviceView device={device}/>
        </div>
    );
};

export default MonitorDevicesViewPageContent;
