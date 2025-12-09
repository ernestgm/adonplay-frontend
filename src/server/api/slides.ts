import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getSlide = async (id: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/slides/${id}`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};
export const fetchSlides = async () => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/slides`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const fetchSlidesByUser = async (userId: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/slides_by_user/${userId}`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const fetchSlidesByBusiness = async (business: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/businesses/${business}/slides`);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const deleteSlides = async (ids: any[]) => {
    try {
        return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/slides`, {'ids': ids});
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const createSlide = async (data: any) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/slides`, data);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al crear usuario.",
        };
    }
};

export const updateSlide = async (id: any, data: any) => {
    try {
        return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/slides/${id}`, data);
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al actualizar usuario.",
        };
    }
};

