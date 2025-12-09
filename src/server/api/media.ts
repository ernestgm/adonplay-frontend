import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getMedia = async (id: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/media/${id}`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al obtener media.",
        };
    }
};

export const fetchMedia = async () => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/media`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al obtener media.",
        };
    }
};

export const fetchMediaExcepted = async (slideId: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/media_excepted/${slideId}`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al obtener media.",
        };
    }
};

export const fetchAudioMediaExcepted = async (slideId: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/all_audio_excepted/${slideId}`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al obtener media.",
        };
    }
};

export const deleteMedia = async (ids: any[]) => {
    try {
        return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/media`, {'ids': ids});
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al eliminar media.",
        };
    }
};

export const createMedia = async (data: any) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/media`, data);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al crear media.",
        };
    }
};

export const updateMedia = async (id: any, data: any) => {
    try {
        return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/media/${id}`, data);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al actualizar media.",
        };
    }
};