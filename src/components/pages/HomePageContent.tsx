"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    MdOutlineTv,
    MdOutlineVideoLibrary,
    MdOutlineViewCarousel,
    MdOutlineTextRotationNone,
    MdOutlineImage,
    MdOutlineMovie,
    MdOutlineAudiotrack,
    MdOutlineDevices,
    MdOutlineArrowForward,
} from "react-icons/md";
import { fetchDevices } from "@/server/api/devices";
import { fetchMedia } from "@/server/api/media";
import { fetchSlides } from "@/server/api/slides";
import { fetchMarquees } from "@/server/api/marquees";
import mediaUrl from "@/utils/files";

type Stat = {
    label: string;
    value: number;
    hint: string;
    icon: React.ReactNode;
    accent: string;
};

type RecentItem = {
    id: string;
    title: string;
    type: string;
    date: string;
    path: string;
    icon: React.ReactNode;
};

function formatDate(value?: string) {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

function mediaIcon(type?: string) {
    if (type === "video") return <MdOutlineMovie size={20} />;
    if (type === "audio") return <MdOutlineAudiotrack size={20} />;
    return <MdOutlineImage size={20} />;
}

const HomePageContent: React.FC = () => {
    const [devices, setDevices] = useState<any[]>([]);
    const [media, setMedia] = useState<any[]>([]);
    const [slides, setSlides] = useState<any[]>([]);
    const [marquees, setMarquees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const [d, m, s, q] = await Promise.all([
                    fetchDevices().catch(() => []),
                    fetchMedia().catch(() => []),
                    fetchSlides().catch(() => []),
                    fetchMarquees().catch(() => []),
                ]);
                if (!active) return;
                setDevices(Array.isArray(d) ? d : []);
                setMedia(Array.isArray(m) ? m : []);
                setSlides(Array.isArray(s) ? s : []);
                setMarquees(Array.isArray(q) ? q : []);
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, []);

    const assigned = devices.filter((d) => d.users_id || d.users).length;

    const stats: Stat[] = [
        {
            label: "Dispositivos",
            value: devices.length,
            hint: `${assigned} con usuario asignado`,
            icon: <MdOutlineTv size={22} />,
            accent: "text-[#7C5CFF] bg-[#7C5CFF]/10",
        },
        {
            label: "Medios",
            value: media.length,
            hint: `${media.filter((m) => m.media_type === "video").length} videos · ${media.filter((m) => m.media_type === "image").length} imágenes`,
            icon: <MdOutlineVideoLibrary size={22} />,
            accent: "text-[#22D3EE] bg-[#22D3EE]/10",
        },
        {
            label: "Slides",
            value: slides.length,
            hint: "Contenido listo para reproducir",
            icon: <MdOutlineViewCarousel size={22} />,
            accent: "text-[#22C55E] bg-[#22C55E]/10",
        },
        {
            label: "Marquees",
            value: marquees.length,
            hint: "Mensajes en cinta",
            icon: <MdOutlineTextRotationNone size={22} />,
            accent: "text-[#F59E0B] bg-[#F59E0B]/10",
        },
    ];

    const recent: RecentItem[] = useMemo(() => {
        const items: RecentItem[] = [
            ...devices.map((d) => ({
                id: `device-${d.id}`,
                title: d.name || d.device_id,
                type: "Dispositivo",
                date: d.created_at,
                path: "/devices",
                icon: <MdOutlineDevices size={18} />,
            })),
            ...media.map((m) => ({
                id: `media-${m.id}`,
                title: (m.file_path || "").split("/").pop() || `Medio ${m.id}`,
                type: m.media_type === "video" ? "Video" : m.media_type === "audio" ? "Audio" : "Imagen",
                date: m.created_at,
                path: "/media-library",
                icon: mediaIcon(m.media_type),
            })),
            ...slides.map((s) => ({
                id: `slide-${s.id}`,
                title: s.name || `Slide ${s.id}`,
                type: "Slide",
                date: s.created_at,
                path: "/slides",
                icon: <MdOutlineViewCarousel size={18} />,
            })),
            ...marquees.map((q) => ({
                id: `marquee-${q.id}`,
                title: q.name || `Marquee ${q.id}`,
                type: "Marquee",
                date: q.created_at,
                path: "/marquees",
                icon: <MdOutlineTextRotationNone size={18} />,
            })),
        ];
        return items
            .filter((i) => i.date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 8);
    }, [devices, media, slides, marquees]);

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-content-primary sm:text-3xl">Panel de control</h1>
                    <p className="mt-1 text-sm text-content-secondary">
                        Resumen de tu red de pantallas y contenido.
                    </p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <Link
                        href="/devices"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-content-primary transition-colors hover:bg-surface-hover sm:w-auto"
                    >
                        Ver dispositivos <MdOutlineArrowForward size={16} />
                    </Link>
                    <Link
                        href="/media-library"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C5CFF] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
                    >
                        Subir contenido <MdOutlineArrowForward size={16} />
                    </Link>
                </div>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-content-muted">
                                    {s.label}
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-content-primary sm:text-3xl">
                                    {loading ? "—" : s.value}
                                </p>
                            </div>
                            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.accent}`}>
                                {s.icon}
                            </span>
                        </div>
                        <p className="mt-3 text-xs text-content-muted">{s.hint}</p>
                    </div>
                ))}
            </div>

            {/* Dispositivos + medios */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5 xl:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-content-primary">Dispositivos</h2>
                        <Link href="/devices" className="text-sm font-medium text-[#7C5CFF]">
                            Ver todos
                        </Link>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-sunken" />
                            ))}
                        </div>
                    ) : devices.length === 0 ? (
                        <p className="py-10 text-center text-sm text-content-muted">
                            Todavía no hay dispositivos.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {devices.slice(0, 9).map((d) => {
                                const ok = Boolean(d.users_id || d.users);
                                return (
                                    <Link
                                        key={d.id}
                                        href="/devices"
                                        className="rounded-xl border border-line bg-surface-sunken p-3 transition-colors hover:bg-surface-hover"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm font-medium text-content-primary">
                                                <MdOutlineTv size={18} />
                                                <span className="truncate">{d.name || "Dispositivo"}</span>
                                            </span>
                                            <span
                                                className={`h-2.5 w-2.5 rounded-full ${ok ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`}
                                                title={ok ? "Con usuario" : "Sin usuario"}
                                            />
                                        </div>
                                        <p className="mt-2 truncate font-mono text-[11px] text-content-muted">
                                            {d.device_id}
                                        </p>
                                        <p className="mt-1 text-[11px] text-content-muted">
                                            {ok ? d.users?.email || "Usuario asignado" : "Sin usuario asignado"}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-content-primary">Librería de medios</h2>
                        <Link href="/media-library" className="text-sm font-medium text-[#7C5CFF]">
                            Ver todo
                        </Link>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-2 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-sunken" />
                            ))}
                        </div>
                    ) : media.length === 0 ? (
                        <p className="py-10 text-center text-sm text-content-muted">Sin medios todavía.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {media.slice(0, 6).map((m) => (
                                <Link
                                    key={m.id}
                                    href="/media-library"
                                    className="group overflow-hidden rounded-xl border border-line bg-surface-sunken"
                                >
                                    <div className="relative flex h-20 items-center justify-center overflow-hidden">
                                        {m.media_type === "image" ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={mediaUrl(m.file_path)}
                                                alt={m.file_path || "media"}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#7C5CFF]/30 to-[#22D3EE]/20 text-content-primary">
                                                {mediaIcon(m.media_type)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="px-2 py-1.5">
                                        <p className="truncate text-[11px] font-medium text-content-primary">
                                            {(m.file_path || "").split("/").pop()}
                                        </p>
                                        <p className="text-[10px] uppercase text-content-muted">{m.media_type}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Actividad reciente */}
            <section className="rounded-2xl border border-line bg-surface shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                    <h2 className="text-base font-semibold text-content-primary">Últimos agregados</h2>
                    <span className="hidden text-xs text-content-muted sm:inline">Dispositivos, medios, slides y marquees</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                        <thead>
                            <tr className="border-y border-line bg-surface-sunken text-[11px] uppercase tracking-wide text-content-muted">
                                <th className="px-5 py-2.5 font-medium">Elemento</th>
                                <th className="px-5 py-2.5 font-medium">Tipo</th>
                                <th className="px-5 py-2.5 font-medium">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-5 py-10 text-center text-content-muted">
                                        Cargando…
                                    </td>
                                </tr>
                            ) : recent.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-5 py-10 text-center text-content-muted">
                                        Sin actividad todavía.
                                    </td>
                                </tr>
                            ) : (
                                recent.map((item) => (
                                    <tr key={item.id} className="border-b border-line last:border-0">
                                        <td className="px-5 py-3">
                                            <Link
                                                href={item.path}
                                                className="flex items-center gap-2 text-content-primary hover:text-[#7C5CFF]"
                                            >
                                                <span className="text-content-secondary">{item.icon}</span>
                                                <span className="truncate">{item.title}</span>
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3 text-content-secondary">{item.type}</td>
                                        <td className="px-5 py-3 text-content-muted">{formatDate(item.date)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default HomePageContent;
