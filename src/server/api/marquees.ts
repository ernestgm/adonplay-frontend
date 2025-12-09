import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";
import { isAxiosError } from "axios";

export const getMarquees = async (id: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/marquees/${id}`);
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
        };
    }
};
export const fetchMarquees = async () => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/marquees`);
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
        };
    }
};

export const fetchMarqueesByUser = async (userId: string | number) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/marquees_by_user/${userId}`);
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
        };
    }
};

// export const fetchMarqueesByBusiness = async () => {
//     try {
//         return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/marquees`);
//     } catch (error) {
//         throw {
//             status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
//             data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
//         };
//     }
// };

export const deleteMarquees = async (ids: number[]) => {
    try {
        return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/marquees`, {'ids': ids});
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
        };
    }
};

export const createMarquees = async (data: Record<string, unknown>) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/marquees`, data);
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Error al crear usuario.") : "Error al crear usuario.",
        };
    }
};

export const updateMarquees = async (id: string | number, data: Record<string, unknown>) => {
    try {
        return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/marquees/${id}`, data);
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Error al actualizar usuario.") : "Error al actualizar usuario.",
        };
    }
};
