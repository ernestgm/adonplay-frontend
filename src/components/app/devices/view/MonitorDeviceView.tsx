"use client";

import React, {useState} from "react";
import Label from "@/components/form/Label";
import ComponentCard from "@/components/common/ComponentCard";
import { useT } from "@/i18n/I18nProvider";
import {useStatusActionsChannel} from "@/websockets/channels/statusActionsChannel";
import CircularChart from "@/components/charts/circular/CircularChart";
import formatBytes from "@/utils/formatBytes";

interface UserFormProps {
    device?: any;
}

interface RamDiskCpuData {
    device_id: string;
    total_ram: number;
    free_ram: number;
    cpu_usage: number;
    total_disk: number;
    free_disk: number;
}

const MonitorDeviceView: React.FC<UserFormProps> = ({device}) => {
    const t = useT("forms.devices");
    const tHeaders = useT("table.headers");
    const tUtil = useT("util");
    const [ramData, setRamData] = useState<{name:string, value: number}[]>([])
    const [diskData, setDiskData] = useState<{name:string, value: number}[]>([])
    const [cpuData, setCpuData] = useState<{name:string, value: number}[]>([])
    const [showCharts, setShowChart] = useState(false)
    const [metrics, setMetrics] = useState<RamDiskCpuData>({
        cpu_usage: 0,
        device_id: "",
        free_disk: 0,
        free_ram: 0,
        total_disk: 0,
        total_ram: 0
    })


    useStatusActionsChannel("frontend", (data: any) => {
        console.log("Device Data ", data);
        const metrics = data as RamDiskCpuData;
        setMetrics(metrics)

        console.log("Devices ", device?.device_id === metrics.device_id);

        if (device?.device_id == metrics.device_id) {
            const ramUsedPercent = metrics.total_ram > 0 ? ((metrics.total_ram - metrics.free_ram) / metrics.total_ram) * 100 : 0;
            const diskUsedPercent = metrics.total_disk > 0 ? ((metrics.total_disk - metrics.free_disk) / metrics.total_disk) * 100 : 0;

            // Datos para Recharts (formato { name: string, value: number })
            const ramData = [
                { name: 'RAM Usada', value: ramUsedPercent },
                { name: 'RAM Libre', value: 100 - ramUsedPercent },
            ];

            const diskData = [
                { name: 'Disco Usado', value: diskUsedPercent },
                { name: 'Disco Libre', value: 100 - diskUsedPercent },
            ];

            const cpuData = [
                { name: 'CPU Uso', value: data.cpu_usage },
                { name: 'CPU Disponible', value: 100 - data.cpu_usage },
            ];

            setCpuData(cpuData)
            setDiskData(diskData)
            setRamData(ramData)

            setShowChart(true)
        }
    }, () => {
        setShowChart(false)
    })

    return (
        <div className="mx-auto p-4 bg-white rounded shadow">
            <div className="mb-5 flex flex-row items-center gap-1">
                <Label>{t("labels.deviceId")} </Label>
                <Label className="font-bold">
                    { device?.device_id }
                </Label>
            </div>
            <div className="mb-5">
                <Label>{t("labels.name")}</Label>
                <Label className="font-bold">{ device?.name }</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="mb-5">
                    <Label>{t("labels.user")}</Label>
                    <div className="flex flex-shrink-0 w-full sm:w-auto">
                        <Label className="font-bold">{ device?.user?.name }</Label>
                    </div>
                </div>
                <div className="mb-5">
                    <Label>{t("labels.slides")}</Label>
                    <div className="flex flex-shrink-0 w-full sm:w-auto">
                        <Label className="font-bold">{ device?.slide ? device?.slide?.name : "No" }</Label>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="mb-5">
                    <Label>{t("labels.qr")}</Label>
                    <div className="flex flex-shrink-0 w-full sm:w-auto">
                        <Label className="font-bold">{ device?.qr ? device?.qr?.name : "No" }</Label>
                    </div>
                </div>
                <div className="mb-5">
                    <Label>{t("labels.marquee")}</Label>
                    <div className="flex flex-shrink-0 w-full sm:w-auto">
                        <Label className="font-bold">{ device?.marquee ? device?.marquee?.name : "No" }</Label>
                    </div>
                </div>
            </div>
            {
                showCharts && (
                    <ComponentCard title={tHeaders("status")} className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="mb-5 flex flex-col items-center">
                                <CircularChart data={ramData} />
                                <h3>{tUtil('ram')} ({formatBytes(metrics.total_ram - metrics.free_ram)} / {formatBytes(metrics.total_ram)})</h3>
                            </div>
                            <div className="mb-5 flex flex-col items-center">
                                <CircularChart data={diskData} />
                                <h3>{tUtil('disk')} ({formatBytes(metrics.total_disk - metrics.free_disk)} / {formatBytes(metrics.total_disk)})</h3>
                            </div>
                            <div className="mb-5 flex flex-col items-center">
                                <CircularChart data={cpuData} />
                                <h3>{tUtil('cpu')} ({metrics.cpu_usage.toFixed(2)}% Uso)</h3>
                            </div>
                        </div>
                    </ComponentCard>
                )
            }
        </div>
    );
};

export default MonitorDeviceView;
