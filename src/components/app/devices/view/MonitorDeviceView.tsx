"use client";

import React, {useState} from "react";
import Label from "@/components/form/Label";
import ComponentCard from "@/components/common/ComponentCard";
import { useT } from "@/i18n/I18nProvider";
import {useStatusActionsChannel} from "@/websockets/channels/statusActionsChannel";
import CircularChart from "@/components/charts/circular/CircularChart";
import formatBytes from "@/utils/formatBytes";
import {useReportActionsChannel} from "@/websockets/channels/reportActionsChannel";
import Button from "@/components/ui/button/Button";
import Image from "@/components/ui/images/ExpandableImage";

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
    const [reportSubscription, setReportSubscription] = useState<any>(null);
    const [screenShotUrl, setScreenShotUrl] = useState("");
    const t = useT("forms.devices");
    const tBtn = useT("common.buttons");
    const tHeaders = useT("common.table.headers");
    const tUtil = useT("util");
    const [ramData, setRamData] = useState<{name:string, value: number}[]>([])
    const [diskData, setDiskData] = useState<{name:string, value: number}[]>([])
    const [cpuData, setCpuData] = useState<{name:string, value: number}[]>([])
    const [showCharts, setShowChart] = useState(false)
    const [showScreenShoot, setShowScreenShoot] = useState(false)
    const [metrics, setMetrics] = useState<RamDiskCpuData>({
        cpu_usage: 0,
        device_id: "",
        free_disk: 0,
        free_ram: 0,
        total_disk: 0,
        total_ram: 0
    })
    const [waiting, setWaiting] = useState(false)


    useStatusActionsChannel("frontend", (data: any) => {
        console.log("Device Data ", data);

        console.log("Devices ", device?.device_id === data.device_id);

        if (device?.device_id === data.device_id) {
            const metrics = data as RamDiskCpuData;
            setMetrics(metrics)
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

    useReportActionsChannel("frontend", (data: any) => {
        if (data.device_id !== device?.device_id) return;
        if (data.action === "screenshot_ready") {
            setWaiting(false)
            setShowScreenShoot(true)
            setScreenShotUrl(data.url);
        }

        console.log("📊 Recibido reporte de estado");
    },() => {
        setWaiting(false)
        setShowScreenShoot(false)
        console.log("❌ Desconectado de ReportActionsChannel");
    }, (subscription: any) => {
        setReportSubscription(subscription);
        console.log("✅ Conectado a ReportActionsChannel");
    })

    const getScreenShot = () => {
        console.log("📷 Taking screenshot", reportSubscription);
        if (reportSubscription) {
            setWaiting(true)
            setShowScreenShoot(false)
            setScreenShotUrl("");
            reportSubscription.perform('request_screenshot', { body: { action: "screenshot", device_id: device?.device_id } });
        }
    }

    return (
        <div className="mx-auto p-4 bg-white rounded shadow">
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <Label>{t("labels.deviceId")} </Label>
                        <Label className="font-bold">
                            { device?.device_id }
                        </Label>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <Label>{t("labels.name")}</Label>
                        <Label className="font-bold">{ device?.name }</Label>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-5">
                        <Button loading={waiting} onClick={() => getScreenShot()} className="w-full">{tBtn("takeScreenshot")}</Button>
                    </div>
                    {
                        showScreenShoot && (
                            <div className="mb-5">
                                <Image
                                    src={screenShotUrl}
                                    alt="Captura de pantalla"
                                    width={600}
                                    height={337}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )
                    }
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
                                <h3>{tUtil('cpu')} ({ metrics.cpu_usage && metrics.cpu_usage.toFixed(2)}% Uso)</h3>
                            </div>
                        </div>
                    </ComponentCard>
                )
            }
        </div>
    );
};

export default MonitorDeviceView;
