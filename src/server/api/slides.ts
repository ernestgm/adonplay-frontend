import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getSlide = async (id) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/slides/${id}`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};
export const fetchSlides = async () => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/slides`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const fetchSlidesByBusiness = async (business) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/businesses/${business}/slides`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const deleteSlides = async (ids) => {
    try {
        return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/slides`, {'ids': ids});
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const createSlide = async (data) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/slides`, data);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al crear usuario.",
        };
    }
};

export const updateSlide = async (id, data) => {
    try {
        return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/slides/${id}`, data);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al actualizar usuario.",
        };
    }
};

