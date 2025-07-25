import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getMedia = async (slide, id) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/slides/${slide}/media/${id}`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al obtener media.",
        };
    }
};

export const fetchMedia = async (slide) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/slides/${slide}/media`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al obtener media.",
        };
    }
};

export const deleteMedia = async (slide,ids) => {
    try {
        return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/slides/${slide}/media`, {'ids': ids});
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al eliminar media.",
        };
    }
};

export const createMedia = async (slide, data) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/slides/${slide}/media`, data);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al crear media.",
        };
    }
};

export const updateMedia = async (slide,id, data) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/slides/${slide}/media/${id}`, data);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al actualizar media.",
        };
    }
};