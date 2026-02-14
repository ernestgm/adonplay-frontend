import {apiDelete, apiGet, apiPut} from "@/server/api/apiClient";
import { isAxiosError } from "axios";

export const getDevice = async (id: any) => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/devices/${id}`);
  } catch (error) {
    throw {
      status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
      data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
    };
  }
};
export const fetchDevices = async () => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/devices`);
  } catch (error) {
    throw {
      status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
      data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
    };
  }
};

export const updateDevices = async (id: any, device: any) => {
  try {
    return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/devices/${id}`, device);
  } catch (error) {
    throw {
      status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
      data: isAxiosError(error) ? (error.response?.data ?? "Error al actualizar Devices.") : "Error al actualizar Devices.",
    };
  }
};

export const deleteDevicesAPI = async (userIds: number[]) => {
    try {
      return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/devices`, {'ids': userIds});
    } catch (error) {
      throw {
        status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
        data: isAxiosError(error) ? (error.response?.data ?? "Error al eliminar Devices.") : "Error al eliminar Devices.",
      };
    }
};

export const fetchDevicesPermissions = async () => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/devices_verify_codes`);
  } catch (error) {
    throw {
      status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
      data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
    };
  }
};

export const updateDevicePermissions = async (id: number, data: any  ) => {
  try {
    return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/devices_verify_codes/${id}`, data);
  } catch (error) {
    throw {
      status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
      data: isAxiosError(error) ? (error.response?.data ?? "Failed to sign out.") : "Failed to sign out.",
    };
  }
};

export const deleteDevicePermissions = async (deviceId: number) => {
  try {
    return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/devices_verify_codes`, {'id': deviceId});
  } catch (error) {
    throw {
      status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
      data: isAxiosError(error) ? (error.response?.data ?? "Error al eliminar Devices.") : "Error al eliminar Devices.",
    };
  }
};
