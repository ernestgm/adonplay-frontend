import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getMarquees = async (id) => {
    try {
        return await apiGet(`${process.env.API_URL}/marquees/${id}`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};
export const fetchMarquees = async () => {
    try {
        return await apiGet(`${process.env.API_URL}/marquees`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const fetchMarqueesByUser = async (userId) => {
    try {
        return await apiGet(`${process.env.API_URL}/marquees_by_user/${userId}`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const fetchMarqueesByBusiness = async (business) => {
    try {
        return await apiGet(`${process.env.API_URL}/marquees`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const deleteMarquees = async (ids) => {
    try {
        return await apiDelete(`${process.env.API_URL}/marquees`, {'ids': ids});
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const createMarquees = async (data) => {
    try {
        return await apiPost(`${process.env.API_URL}/marquees`, data);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al crear usuario.",
        };
    }
};

export const updateMarquees = async (id, data) => {
    try {
        return await apiPut(`${process.env.API_URL}/marquees/${id}`, data);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al actualizar usuario.",
        };
    }
};
