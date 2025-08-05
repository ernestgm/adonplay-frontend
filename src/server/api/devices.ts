import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getDevice = async (id) => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/devices/${id}`);
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Failed to sign out.",
    };
  }
};
export const fetchDevices = async () => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/devices`);
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Failed to sign out.",
    };
  }
};

export const updateDevices = async (id, device) => {
  try {
    return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/devices/${id}`, device);
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Error al actualizar Devices.",
    };
  }
};

export const deleteDevicesAPI = async (userIds: number[]) => {
    try {
      return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/devices`, {'ids': userIds});
    } catch (error) {
      throw {
        status: error.response?.status || 500,
        data: error.response?.data || "Error al eliminar Devices.",
      };
    }
};
