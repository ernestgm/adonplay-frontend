import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getSlideMedias = async (id: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/slide_media/${id}`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};
export const fetchSlideMedias = async (slide: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/slides/${slide}/media`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const deleteSlideMedias = async (ids: any) => {
    try {
        return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/slide_media`, {'ids': ids});
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const createSlideMedias = async (data: any) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/slide_media`, data);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al crear usuario.",
        };
    }
};

export const updateSlideMedias = async (id: any, data: any) => {
    try {
        return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/slide_media/${id}`, data);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al actualizar usuario.",
        };
    }
};

