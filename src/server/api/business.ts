import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";
import { isAxiosError } from "axios";

export const getBusiness = async (id: any) => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/businesses/${id}`);
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
        };
    }
};
export const fetchBusinesses = async () => {
    try {
        return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/businesses`);
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
        };
    }
};

export const deleteBusinessesAPI = async (ids: number[] = []) => {
    try {
        return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/businesses`, {'ids': ids});
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
        };
    }
};

export const createBusiness = async (data: any) => {
    try {
        return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/businesses`, data);
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Error al crear el Negocio.") : "Error al crear el Negocio.",
        };
    }
};

export const updateBusiness = async (id: any, data: any) => {
    try {
        return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/businesses/${id}`, data);
    } catch (error) {
        throw {
            status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
            data: isAxiosError(error) ? (error.response?.data ?? "Error al actualizar el Negocio.") : "Error al actualizar el Negocio.",
        };
    }
};

