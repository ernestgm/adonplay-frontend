import { apiDelete, apiGet, apiPost, apiPut } from "@/server/api/apiClient";

export type SchedulePayload = {
    device_id: number;
    resource_type: "slide" | "marquee";
    slide_id?: number | null;
    marquee_id?: number | null;
    days_of_week: string;
    start_time: string;
    end_time: string;
    timezone: string;
    active: boolean;
    priority?: number;
};

export const fetchSchedules = async () => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/schedules`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al obtener la programación.",
        };
    }
};

export const createSchedule = async (payload: SchedulePayload) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/schedules`, payload);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al crear la programación.",
        };
    }
};

export const updateSchedule = async (id: number, payload: Partial<SchedulePayload>) => {
    try {
        return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/schedules/${id}`, payload);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al actualizar la programación.",
        };
    }
};

export const deleteSchedule = async (id: number) => {
    try {
        return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/schedules/${id}`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al eliminar la programación.",
        };
    }
};
