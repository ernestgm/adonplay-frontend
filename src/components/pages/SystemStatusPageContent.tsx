"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    MdOutlineMemory,
    MdOutlineStorage,
    MdOutlineSpeed,
    MdOutlineSchedule,
    MdOutlineLock,
    MdOutlineCloudDone,
    MdOutlineCloudOff,
    MdOutlineRefresh,
} from "react-icons/md";
import { fetchSystemStatus, type SystemStatus } from "@/server/api/systemStatus";

const REFRESH_MS = 20000;

function formatBytes(value?: number): string {
    if (!value || value <= 0) return "—";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    return `${(value / 1024 ** index).toFixed(1)} ${units[index]}`;
}

function formatUptime(seconds?: number): string {
    if (!seconds) return "—";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function formatDate(value?: string): string {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
    } catch {
        return value;
    }
}

function usageColor(percent: number): string {
    if (percent >= 90) return "bg-[#EF4444]";
    if (percent >= 75) return "bg-[#F59E0B]";
    return "bg-[#22C55E]";
}

const Bar: React.FC<{ percent: number }> = ({ percent }) => (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div
            className={`h-full rounded-full transition-all ${usageColor(percent)}`}
            style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
    </div>
);

const SystemStatusPageContent: React.FC = () => {
    const [data, setData] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

    const load = useCallback(async () => {
        try {
            const status = await fetchSystemStatus();
            setData(status);
            setUpdatedAt(new Date());
            setError("");
        } catch (err: any) {
            setError(err.data?.error || err.data?.message || err.message || "Error al obtener el estado.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => clearInterval(timer);
    }, [load]);

    const host = data?.host;

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-content-primary sm:text-3xl">Estado del sistema</h1>
                    <p className="mt-1 text-sm text-content-secondary">
                        Contenedores, carga del servidor y certificados SSL.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-content-muted">
                        {updatedAt ? `Actualizado ${updatedAt.toLocaleTimeString("es-ES")}` : "—"}
                    </span>
                    <button
                        type="button"
                        onClick={load}
                        className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover"
                    >
                        <MdOutlineRefresh size={16} /> Actualizar
                    </button>
                </div>
            </header>

            {error && (
                <div className="rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
                    {error}
                </div>
            )}

            {/* Host */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Carga (1/5/15)</p>
                            <p className="mt-2 text-2xl font-semibold text-content-primary">
                                {host ? host.load.map((n) => n.toFixed(2)).join(" · ") : "—"}
                            </p>
                        </div>
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C5CFF]/10 text-[#7C5CFF]">
                            <MdOutlineSpeed size={22} />
                        </span>
                    </div>
                    <p className="mt-3 text-xs text-content-muted">Valor ideal por debajo del número de CPUs</p>
                </div>

                <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Memoria</p>
                            <p className="mt-2 text-2xl font-semibold text-content-primary">
                                {host ? `${host.memory.used_percent}%` : "—"}
                            </p>
                        </div>
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22D3EE]/10 text-[#22D3EE]">
                            <MdOutlineMemory size={22} />
                        </span>
                    </div>
                    <Bar percent={host?.memory.used_percent || 0} />
                    <p className="mt-2 text-xs text-content-muted">
                        {host ? `${formatBytes(host.memory.total - host.memory.available)} de ${formatBytes(host.memory.total)}` : "—"}
                    </p>
                </div>

                <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Disco</p>
                            <p className="mt-2 text-2xl font-semibold text-content-primary">
                                {host ? `${host.disk.used_percent}%` : "—"}
                            </p>
                        </div>
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
                            <MdOutlineStorage size={22} />
                        </span>
                    </div>
                    <Bar percent={host?.disk.used_percent || 0} />
                    <p className="mt-2 text-xs text-content-muted">
                        {host ? `${formatBytes(host.disk.total - host.disk.free)} de ${formatBytes(host.disk.total)}` : "—"}
                    </p>
                </div>

                <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Uptime</p>
                            <p className="mt-2 text-2xl font-semibold text-content-primary">
                                {host ? formatUptime(host.uptime_seconds) : "—"}
                            </p>
                        </div>
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
                            <MdOutlineSchedule size={22} />
                        </span>
                    </div>
                    <p className="mt-3 text-xs text-content-muted">Tiempo desde el arranque del contenedor API</p>
                </div>
            </div>

            {/* Servicios */}
            <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5">
                <h2 className="mb-4 text-base font-semibold text-content-primary">Servicios</h2>
                {loading && !data ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-sunken" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {(data?.services || []).map((service) => (
                            <div key={service.name} className="rounded-xl border border-line bg-surface-sunken p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-content-primary">{service.name}</span>
                                    {service.status === "up" ? (
                                        <MdOutlineCloudDone size={18} className="text-[#22C55E]" />
                                    ) : (
                                        <MdOutlineCloudOff size={18} className="text-[#EF4444]" />
                                    )}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                            service.status === "up"
                                                ? "bg-[#22C55E]/15 text-[#22C55E]"
                                                : "bg-[#EF4444]/15 text-[#EF4444]"
                                        }`}
                                    >
                                        {service.status === "up" ? "Operativo" : "Caído"}
                                    </span>
                                    <span className="text-[11px] text-content-muted">
                                        {service.latency_ms != null ? `${service.latency_ms} ms` : service.error || "—"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* SSL */}
            <section className="rounded-2xl border border-line bg-surface shadow-sm">
                <div className="flex items-center justify-between px-4 py-4 sm:px-5">
                    <h2 className="text-base font-semibold text-content-primary">Certificados SSL</h2>
                    <span className="hidden text-xs text-content-muted sm:inline">Se revalida cada hora</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                            <tr className="border-y border-line bg-surface-sunken text-[11px] uppercase tracking-wide text-content-muted">
                                <th className="px-5 py-2.5 font-medium">Dominio</th>
                                <th className="px-5 py-2.5 font-medium">Estado</th>
                                <th className="px-5 py-2.5 font-medium">Días restantes</th>
                                <th className="px-5 py-2.5 font-medium">Vence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && !data ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-8 text-center text-content-muted">Cargando…</td>
                                </tr>
                            ) : (data?.ssl || []).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-8 text-center text-content-muted">Sin datos.</td>
                                </tr>
                            ) : (
                                data!.ssl.map((ssl) => {
                                    const days = ssl.days_left ?? 0;
                                    const color =
                                        ssl.status !== "ok" || days <= 15
                                            ? "bg-[#EF4444]/15 text-[#EF4444]"
                                            : days <= 30
                                                ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                                                : "bg-[#22C55E]/15 text-[#22C55E]";
                                    return (
                                        <tr key={ssl.domain} className="border-b border-line last:border-0">
                                            <td className="px-5 py-3">
                                                <span className="flex items-center gap-2 text-content-primary">
                                                    <MdOutlineLock size={16} /> {ssl.domain}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${color}`}>
                                                    {ssl.status === "ok" ? "Válido" : "Error"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-medium text-content-primary">
                                                {ssl.status === "ok" ? `${days} días` : "—"}
                                            </td>
                                            <td className="px-5 py-3 text-content-muted">
                                                {ssl.expires_at ? formatDate(ssl.expires_at) : ssl.message || "—"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default SystemStatusPageContent;
