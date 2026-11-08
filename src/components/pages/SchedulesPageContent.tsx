"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
    MdOutlineAdd,
    MdOutlineClose,
    MdOutlineDelete,
    MdOutlineCalendarMonth,
} from "react-icons/md";
import {
    createSchedule,
    deleteSchedule,
    fetchSchedules,
    updateSchedule,
    type SchedulePayload,
} from "@/server/api/schedules";
import { fetchDevices } from "@/server/api/devices";
import { fetchSlides } from "@/server/api/slides";
import { fetchMarquees } from "@/server/api/marquees";

const DAYS: [string, string][] = [
    ["1", "Lun"],
    ["2", "Mar"],
    ["3", "Mié"],
    ["4", "Jue"],
    ["5", "Vie"],
    ["6", "Sáb"],
    ["7", "Dom"],
];

type ModalState = {
    open: boolean;
    editing: any | null;
    device_id: number | "";
    resource_type: "slide" | "marquee";
    resource_id: number | "";
    days: string[];
    start_time: string;
    end_time: string;
    active: boolean;
};

const emptyModal: ModalState = {
    open: false,
    editing: null,
    device_id: "",
    resource_type: "slide",
    resource_id: "",
    days: ["1", "2", "3", "4", "5"],
    start_time: "09:00",
    end_time: "18:00",
    active: true,
};

const CALENDAR_PLUGINS = [timeGridPlugin, interactionPlugin];
const CALENDAR_LOCALES = [esLocale];
const HEADER_TOOLBAR = { left: "prev,next today", center: "title", right: "" };
const CALENDAR_BUTTON_TEXT = { today: "Hoy" };

function addDays(base: Date, days: number) {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
}

function atTime(base: Date, time: string) {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(base);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
}

const SchedulesPageContent: React.FC = () => {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [devices, setDevices] = useState<any[]>([]);
    const [slides, setSlides] = useState<any[]>([]);
    const [marquees, setMarquees] = useState<any[]>([]);
    const [weekStart, setWeekStart] = useState<Date>(() => {
        const now = new Date();
        const day = now.getDay() === 0 ? 7 : now.getDay();
        const monday = addDays(now, -(day - 1));
        monday.setHours(0, 0, 0, 0);
        return monday;
    });
    const [deviceFilter, setDeviceFilter] = useState<string>("");
    const [showInactive, setShowInactive] = useState(false);
    const [modal, setModal] = useState<ModalState>(emptyModal);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        const [s, d, sl, mq] = await Promise.all([
            fetchSchedules().catch(() => []),
            fetchDevices().catch(() => []),
            fetchSlides().catch(() => []),
            fetchMarquees().catch(() => []),
        ]);
        setSchedules(Array.isArray(s) ? s : []);
        setDevices(Array.isArray(d) ? d : []);
        setSlides(Array.isArray(sl) ? sl : []);
        setMarquees(Array.isArray(mq) ? mq : []);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(
        () => (deviceFilter ? schedules.filter((s) => String(s.device_id) === deviceFilter) : schedules),
        [schedules, deviceFilter]
    );

    const events = useMemo(() => {
        const list: any[] = [];
        for (const s of filtered) {
            if (!s.active && !showInactive) continue;
            const inactive = !s.active;
            const name = s.resource_type === "slide" ? s.slide?.name : s.marquee?.name;
            const days = String(s.days_of_week || "")
                .split(",")
                .map(Number)
                .filter((d) => d >= 1 && d <= 7);
            for (const day of days) {
                const base = addDays(weekStart, day - 1);
                list.push({
                    id: `${s.id}-${day}`,
                    title: `${s.device?.name || "Equipo"} · ${name || s.resource_type}${inactive ? " (inactiva)" : ""}`,
                    start: atTime(base, s.start_time),
                    end: atTime(base, s.end_time),
                    backgroundColor: inactive
                        ? "#4B5563"
                        : s.resource_type === "slide"
                            ? "#7C5CFF"
                            : "#22D3EE",
                    borderColor: "transparent",
                    textColor: inactive
                        ? "#D1D5DB"
                        : s.resource_type === "slide"
                            ? "#ffffff"
                            : "#062c41",
                    extendedProps: { schedule: s },
                });
            }
        }
        return list;
    }, [filtered, weekStart, showInactive]);

    const openCreate = (date?: Date) => {
        const base = date ? new Date(date) : new Date();
        const day = base.getDay() === 0 ? 7 : base.getDay();
        const startTime = date ? base.toTimeString().slice(0, 5) : "09:00";
        const end = date ? atTime(base, startTime) : null;
        if (end) end.setHours(end.getHours() + 1);
        setError("");
        setModal({
            ...emptyModal,
            open: true,
            device_id: deviceFilter ? Number(deviceFilter) : devices[0]?.id || "",
            days: [String(day)],
            start_time: startTime,
            end_time: end ? end.toTimeString().slice(0, 5) : "18:00",
        });
    };

    const openEdit = (schedule: any) => {
        setError("");
        setModal({
            open: true,
            editing: schedule,
            device_id: schedule.device_id,
            resource_type: schedule.resource_type,
            resource_id: schedule.resource_type === "slide" ? schedule.slide_id : schedule.marquee_id,
            days: String(schedule.days_of_week || "").split(",").filter(Boolean),
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            active: Boolean(schedule.active),
        });
    };

    const closeModal = () => setModal(emptyModal);

    const toggleDay = (day: string) => {
        setModal((prev) => ({
            ...prev,
            days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day].sort(),
        }));
    };

    const handleSave = async () => {
        setError("");
        if (!modal.device_id) return setError("Elegí un dispositivo.");
        if (!modal.resource_id) return setError("Elegí un slide o una marquesina.");
        if (modal.days.length === 0) return setError("Elegí al menos un día.");
        if (modal.end_time <= modal.start_time) return setError("La hora de fin debe ser posterior al inicio.");

        const payload: SchedulePayload = {
            device_id: Number(modal.device_id),
            resource_type: modal.resource_type,
            slide_id: modal.resource_type === "slide" ? Number(modal.resource_id) : null,
            marquee_id: modal.resource_type === "marquee" ? Number(modal.resource_id) : null,
            days_of_week: [...modal.days].sort().join(","),
            start_time: modal.start_time,
            end_time: modal.end_time,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
            active: modal.active,
        };

        setSaving(true);
        try {
            if (modal.editing) {
                await updateSchedule(modal.editing.id, payload);
            } else {
                await createSchedule(payload);
            }
            closeModal();
            await load();
        } catch (err: any) {
            const data = err.data;
            setError(Array.isArray(data?.errors) ? data.errors.join(" · ") : data?.error || data?.message || "No se pudo guardar.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!modal.editing) return;
        setSaving(true);
        try {
            await deleteSchedule(modal.editing.id);
            closeModal();
            await load();
        } catch (err: any) {
            setError(err.data?.error || "No se pudo eliminar.");
        } finally {
            setSaving(false);
        }
    };

    const resources = modal.resource_type === "slide" ? slides : marquees;

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-content-primary sm:text-3xl">Programación</h1>
                    <p className="mt-1 text-sm text-content-secondary">
                        Programá slides y marquesinas por día y horario.
                    </p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <select
                        value={deviceFilter}
                        onChange={(e) => setDeviceFilter(e.target.value)}
                        aria-label="Filtrar por dispositivo"
                        className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-content-primary sm:w-auto"
                    >
                        <option value="">Todos los dispositivos</option>
                        {devices.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name || d.device_id}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => openCreate()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C5CFF] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 sm:w-auto"
                    >
                        <MdOutlineAdd size={18} /> Nueva programación
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap items-center gap-4 text-xs text-content-muted">
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#7C5CFF]" /> Slide
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#22D3EE]" /> Marquesina
                </span>
                <label className="ml-auto flex items-center gap-2 text-xs text-content-secondary">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-line"
                    />
                    Mostrar inactivas
                </label>
                <span className="hidden text-content-muted sm:inline">
                    Click en el calendario para crear · click en un evento para editar
                </span>
            </div>

            <div className="adonplay-calendar rounded-2xl border border-line bg-surface p-3 sm:p-4">
                <FullCalendar
                    plugins={CALENDAR_PLUGINS}
                    initialView="timeGridWeek"
                    firstDay={1}
                    locale="es"
                    locales={CALENDAR_LOCALES}
                    headerToolbar={HEADER_TOOLBAR}
                    buttonText={CALENDAR_BUTTON_TEXT}
                    allDaySlot={false}
                    slotMinTime="00:00:00"
                    slotMaxTime="24:00:00"
                    slotDuration="00:30:00"
                    height="auto"
                    nowIndicator
                    events={events}
                    datesSet={(info) => {
                        const start = info.view.currentStart;
                        setWeekStart((prev) => (prev.getTime() === start.getTime() ? prev : start));
                    }}
                    dateClick={(arg) => openCreate(arg.date)}
                    eventClick={(arg) => openEdit(arg.event.extendedProps.schedule)}
                    eventDisplay="block"
                    dayMaxEvents={false}
                     slotLaneClassNames={(arg) => {
                         if (!arg.date) return [];
                         const slotDate = arg.date;
                         const hasSchedule = events.some((event) => {
                             const start = event.start instanceof Date ? event.start : new Date(event.start);
                             const end = event.end instanceof Date ? event.end : new Date(event.end);
                             return slotDate >= start && slotDate < end;
                        });

                        return hasSchedule ? [] : ["fc-timegrid-slot-empty"];
                    }}
                />
            </div>

            {modal.open && (
                <div className="fixed inset-0 z-[999999] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
                    <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 shadow-xl sm:max-w-lg sm:rounded-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-content-primary">
                                <MdOutlineCalendarMonth size={20} />
                                {modal.editing ? "Editar programación" : "Nueva programación"}
                            </h2>
                            <button type="button" onClick={closeModal} aria-label="Cerrar" className="text-content-muted hover:text-content-primary">
                                <MdOutlineClose size={22} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-sm text-[#EF4444]">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-content-secondary">Dispositivo</label>
                                <select
                                    value={modal.device_id}
                                    onChange={(e) => setModal((p) => ({ ...p, device_id: Number(e.target.value) }))}
                                    className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-content-primary"
                                >
                                    <option value="">Elegí un dispositivo</option>
                                    {devices.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name || d.device_id}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-content-secondary">Tipo</label>
                                    <select
                                        value={modal.resource_type}
                                        onChange={(e) =>
                                            setModal((p) => ({
                                                ...p,
                                                resource_type: e.target.value as "slide" | "marquee",
                                                resource_id: "",
                                            }))
                                        }
                                        className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-content-primary"
                                    >
                                        <option value="slide">Slide</option>
                                        <option value="marquee">Marquesina</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-content-secondary">
                                        {modal.resource_type === "slide" ? "Slide" : "Marquesina"}
                                    </label>
                                    <select
                                        value={modal.resource_id}
                                        onChange={(e) => setModal((p) => ({ ...p, resource_id: Number(e.target.value) }))}
                                        className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-content-primary"
                                    >
                                        <option value="">Elegí uno</option>
                                        {resources.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name || `#${r.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <span className="mb-1 block text-xs font-medium text-content-secondary">Días</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {DAYS.map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => toggleDay(value)}
                                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                                modal.days.includes(value)
                                                    ? "bg-[#7C5CFF] text-white"
                                                    : "border border-line bg-surface text-content-secondary hover:bg-surface-hover"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-content-secondary">Desde</label>
                                    <input
                                        type="time"
                                        value={modal.start_time}
                                        onChange={(e) => setModal((p) => ({ ...p, start_time: e.target.value }))}
                                        className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-content-primary"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-content-secondary">Hasta</label>
                                    <input
                                        type="time"
                                        value={modal.end_time}
                                        onChange={(e) => setModal((p) => ({ ...p, end_time: e.target.value }))}
                                        className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-content-primary"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-content-secondary">
                                <input
                                    type="checkbox"
                                    checked={modal.active}
                                    onChange={(e) => setModal((p) => ({ ...p, active: e.target.checked }))}
                                    className="h-4 w-4 rounded border-line"
                                />
                                Activa
                            </label>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                {modal.editing && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={saving}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#EF4444]/40 px-3 py-2.5 text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10"
                                    >
                                        <MdOutlineDelete size={18} /> Eliminar
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-content-primary hover:bg-surface-hover"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="rounded-xl bg-[#7C5CFF] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                                >
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchedulesPageContent;
