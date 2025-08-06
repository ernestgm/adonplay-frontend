import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getQrCode = async (id) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/qrs/${id}`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};
export const fetchQrCode = async () => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/qrs`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const fetchQrCodeByUser = async (userId) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/qrs_by_user/${userId}`);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Failed to sign out.",
        };
    }
};

export const createQrCode = async (user) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/qrs`, user);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al crear usuario.",
        };
    }
};

export const updateQrCode = async (id, user) => {
    try {
        return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/qrs/${id}`, user);
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al actualizar usuario.",
        };
    }
};

export const deleteQrCode = async (userIds: number[]) => {
    try {
        return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/qrs`, {'ids': userIds});
    } catch (error) {
        throw {
            status: error.response?.status || 500,
            data: error.response?.data || "Error al eliminar usuarios.",
        };
    }
};

