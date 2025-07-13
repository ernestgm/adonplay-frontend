// src/server/api/apiClient.ts
import axios from "axios";
import Cookies from "js-cookie";

const getAuthHeaders = () => {
    const token = Cookies.get("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiRequest = async (method: string, url: string, data: any = null, headers = {}, isPublic = false) => {
    try {
        const response = await axios({
            method,
            url,
            data,
            headers: isPublic ? { ...headers } : { ...getAuthHeaders(), ...headers },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const apiGet = (url: string, headers = {}, isPublic = false) => apiRequest("get", url, null, headers, isPublic);
export const apiPost = (url: string, data: any, headers = {}, isPublic = false) => apiRequest("post", url, data, headers, isPublic);
export const apiPut = (url: string, data: any, headers = {}, isPublic = false) => apiRequest("put", url, data, headers, isPublic);
export const apiDelete = (url: string, headers = {}, isPublic = false) => apiRequest("delete", url, null, headers, isPublic);
