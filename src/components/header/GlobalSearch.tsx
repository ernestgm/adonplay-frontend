"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
    MdSearch,
    MdClose,
    MdArrowBack,
    MdOutlineTv,
    MdOutlineVideoLibrary,
    MdOutlineViewCarousel,
    MdOutlineTextRotationNone,
    MdOutlineSupervisedUserCircle,
} from "react-icons/md";
import { getDataUserAuth } from "@/server/api/auth";
import { fetchDevices } from "@/server/api/devices";
import { fetchMedia } from "@/server/api/media";
import { fetchSlides } from "@/server/api/slides";
import { fetchMarquees } from "@/server/api/marquees";
import { fetchUsers } from "@/server/api/users";

type Result = {
    id: string;
    group: string;
    title: string;
    subtitle?: string;
    path: string;
    icon: React.ReactNode;
};

type RawData = {
    devices: any[];
    media: any[];
    slides: any[];
    marquees: any[];
    users: any[];
};

const normalize = (value: unknown): string =>
    String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const fileName = (path?: string) => (path || "").split("/").pop() || "";

const GROUP_ORDER = ["Dispositivos", "Medios", "Slides", "Marquees", "Usuarios"];

export default function GlobalSearch() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [dataVersion, setDataVersion] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [results, setResults] = useState<Result[]>([]);
    const dataRef = useRef<RawData | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const buildResults = useCallback((data: RawData): Result[] => {
        return [
            ...data.devices.map((d) => ({
                id: `device-${d.id}`,
                group: "Dispositivos",
                title: d.name || d.device_id || `Dispositivo ${d.id}`,
                subtitle: [d.device_id, d.users?.email].filter(Boolean).join(" · "),
                path: "/devices",
                icon: <MdOutlineTv size={18} />,
            })),
            ...data.media.map((m) => ({
                id: `media-${m.id}`,
                group: "Medios",
                title: fileName(m.file_path) || `Medio ${m.id}`,
                subtitle: [m.media_type, m.owner?.email].filter(Boolean).join(" · "),
                path: "/media-library",
                icon: <MdOutlineVideoLibrary size={18} />,
            })),
            ...data.slides.map((s) => ({
                id: `slide-${s.id}`,
                group: "Slides",
                title: s.name || `Slide ${s.id}`,
                subtitle: s.description || `Slide ${s.id}`,
                path: "/slides",
                icon: <MdOutlineViewCarousel size={18} />,
            })),
            ...data.marquees.map((m) => ({
                id: `marquee-${m.id}`,
                group: "Marquees",
                title: m.name || `Marquee ${m.id}`,
                subtitle: m.message || "",
                path: "/marquees",
                icon: <MdOutlineTextRotationNone size={18} />,
            })),
            ...data.users.map((u) => ({
                id: `user-${u.id}`,
                group: "Usuarios",
                title: u.name || u.email || `Usuario ${u.id}`,
                subtitle: [u.email, u.role].filter(Boolean).join(" · "),
                path: "/users",
                icon: <MdOutlineSupervisedUserCircle size={18} />,
            })),
        ];
    }, []);

    const loadData = useCallback(async () => {
        if (dataRef.current) return;
        setLoading(true);
        try {
            const user = getDataUserAuth();
            const isAdmin = user?.role === "admin";
            const [devices, media, slides, marquees, users] = await Promise.all([
                fetchDevices().catch(() => []),
                fetchMedia().catch(() => []),
                fetchSlides().catch(() => []),
                fetchMarquees().catch(() => []),
                isAdmin ? fetchUsers().catch(() => []) : Promise.resolve([]),
            ]);
            dataRef.current = {
                devices: Array.isArray(devices) ? devices : [],
                media: Array.isArray(media) ? media : [],
                slides: Array.isArray(slides) ? slides : [],
                marquees: Array.isArray(marquees) ? marquees : [],
                users: Array.isArray(users) ? users : [],
            };
            setDataVersion((v) => v + 1);
        } finally {
            setLoading(false);
        }
    }, []);

    // Abrir con Ctrl/Cmd+K (desktop) o preparar el overlay (móvil)
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                if (window.innerWidth < 768) {
                    setMobileOpen(true);
                    setTimeout(() => mobileInputRef.current?.focus(), 50);
                } else {
                    setOpen(true);
                    inputRef.current?.focus();
                }
            }
            if (e.key === "Escape") {
                setOpen(false);
                setMobileOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // Cerrar al click afuera (solo dropdown desktop)
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    // Bloquear scroll del body con el overlay móvil
    useEffect(() => {
        if (!mobileOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        void loadData();
        setTimeout(() => mobileInputRef.current?.focus(), 50);
        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileOpen, loadData]);

    // Buscar (local, insensible a acentos/mayúsculas, con ranking)
    useEffect(() => {
        const q = normalize(query);
        if (!q || !dataRef.current) {
            setResults([]);
            setActiveIndex(0);
            return;
        }
        const scored = buildResults(dataRef.current)
            .map((item) => {
                const title = normalize(item.title);
                const subtitle = normalize(item.subtitle);
                let score = 0;
                if (title === q) score = 5;
                else if (title.startsWith(q)) score = 4;
                else if (title.includes(q)) score = 3;
                else if (subtitle.includes(q)) score = 2;
                return { item, score };
            })
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 24)
            .map((x) => x.item);
        setResults(scored);
        setActiveIndex(0);
    }, [query, buildResults, dataVersion]);

    const grouped = useMemo(() => {
        const map = new Map<string, Result[]>();
        for (const r of results) {
            if (!map.has(r.group)) map.set(r.group, []);
            map.get(r.group)!.push(r);
        }
        return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
    }, [results]);

    const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

    const go = (result: Result) => {
        setOpen(false);
        setMobileOpen(false);
        setQuery("");
        router.push(result.path);
    };

    const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && flat[activeIndex]) {
            e.preventDefault();
            go(flat[activeIndex]);
        }
    };

    const renderResults = () => (
        <>
            {loading && <div className="px-3 py-6 text-sm text-content-muted">Cargando datos...</div>}
            {!loading && flat.length === 0 && query.length > 0 && (
                <div className="px-3 py-6 text-sm text-content-muted">
                    Sin resultados para “{query}”.
                </div>
            )}
            {!loading &&
                grouped.map((group) => (
                    <div key={group.group} className="mb-1">
                        <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-content-muted">
                            {group.group}
                        </div>
                        {group.items.map((item) => {
                            const index = flat.indexOf(item);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => go(item)}
                                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                        index === activeIndex ? "bg-surface-active" : "hover:bg-surface-hover"
                                    }`}
                                >
                                    <span className="text-content-secondary">{item.icon}</span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-content-primary">
                                            {item.title}
                                        </span>
                                        {item.subtitle && (
                                            <span className="block truncate text-xs text-content-muted">
                                                {item.subtitle}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ))}
        </>
    );

    return (
        <>
            {/* Desktop */}
            <div ref={containerRef} className="relative hidden w-full max-w-xl md:block">
                <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-sunken px-3 py-2 focus-within:border-line-strong">
                    <MdSearch size={18} className="text-content-muted" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (!open) setOpen(true);
                        }}
                        onFocus={() => {
                            setOpen(true);
                            void loadData();
                        }}
                        onKeyDown={onInputKeyDown}
                        placeholder="Buscar dispositivos, medios, slides, usuarios..."
                        aria-label="Buscar en todo el sistema"
                        className="w-full bg-transparent text-sm text-content-primary placeholder:text-content-muted outline-none"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label="Limpiar búsqueda"
                            className="text-content-muted hover:text-content-primary"
                        >
                            <MdClose size={16} />
                        </button>
                    ) : (
                        <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[10px] text-content-muted sm:block">
                            Ctrl K
                        </kbd>
                    )}
                </div>

                {open && (query.length > 0 || loading) && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-99999 max-h-[420px] overflow-y-auto rounded-xl border border-line bg-surface p-2 shadow-lg">
                        {renderResults()}
                    </div>
                )}
            </div>

            {/* Mobile: botón que abre overlay */}
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Buscar en todo el sistema"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-content-secondary md:hidden"
            >
                <MdSearch size={20} />
            </button>

            {/* Mobile: overlay full-screen (portal para quedar sobre sidebar/header) */}
            {mobileOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[999999] flex flex-col bg-surface md:hidden">
                        <div className="flex items-center gap-2 border-b border-line px-3 py-3 pt-[max(12px,env(safe-area-inset-top))]">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Cerrar búsqueda"
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-content-secondary"
                            >
                                <MdArrowBack size={22} />
                            </button>
                            <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-surface-sunken px-3 py-2">
                                <MdSearch size={18} className="text-content-muted" />
                                <input
                                    ref={mobileInputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={onInputKeyDown}
                                    placeholder="Buscar..."
                                    aria-label="Buscar en todo el sistema"
                                    className="w-full bg-transparent text-base text-content-primary placeholder:text-content-muted outline-none"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery("")}
                                        aria-label="Limpiar búsqueda"
                                        className="text-content-muted"
                                    >
                                        <MdClose size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 pb-[max(16px,env(safe-area-inset-bottom))]">
                            {query.length === 0 ? (
                                <p className="px-3 py-6 text-sm text-content-muted">
                                    Buscá dispositivos, medios, slides, marquees o usuarios.
                                </p>
                            ) : (
                                renderResults()
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
