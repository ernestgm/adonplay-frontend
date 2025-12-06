import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getBusiness = async (id) => {
    try {
        return await apiGet(`${process.env.API_URL}/businesses/${id}`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};
export const fetchBusinesses = async () => {
    try {
        return await apiGet(`${process.env.API_URL}/businesses`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const deleteBusinessesAPI = async (ids) => {
    try {
        return await apiDelete(`${process.env.API_URL}/businesses`, {'ids': ids});
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const createBusiness = async (data) => {
    try {
        return await apiPost(`${process.env.API_URL}/businesses`, data);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al crear el Negocio.",
        };
    }
};

export const updateBusiness = async (id, data) => {
    try {
        return await apiPut(`${process.env.API_URL}/businesses/${id}`, data);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al actualizar el Negocio.",
        };
    }
};

