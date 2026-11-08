import { apiGet } from "@/server/api/apiClient";

export type SystemServiceStatus = {
    name: string;
    status: "up" | "down";
    http_status?: number;
    latency_ms?: number | null;
    error?: string;
};

export type SystemSslStatus = {
    domain: string;
    status: "ok" | "error";
    expires_at?: string;
    days_left?: number;
    issuer?: string;
    error?: string;
    message?: string;
};

export type SystemStatus = {
    timestamp: string;
    host: {
        uptime_seconds: number;
        load: [number, number, number];
        memory: { total: number; available: number; used_percent: number };
        disk: { total: number; free: number; used_percent: number };
    };
    services: SystemServiceStatus[];
    ssl: SystemSslStatus[];
};

export const fetchSystemStatus = async (): Promise<SystemStatus> => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/system_status`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al obtener el estado del sistema.",
        };
    }
};
