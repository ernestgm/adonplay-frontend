import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getUser = async (id: any) => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
  } catch (error: any) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Failed to sign out.",
    };
  }
};
export const fetchUsers = async () => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/users`);
  } catch (error: any) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Failed to sign out.",
    };
  }
};

export const createUser = async (user: any) => {
  try {
    return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/users`, user);
  } catch (error: any) {
    console.log(error);
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Error al crear usuario.",
    };
  }
};

export const updateUser = async (id: any, user: any) => {
  try {
    return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, user);
  } catch (error: any) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Error al actualizar usuario.",
    };
  }
};

export const deleteUsersAPI = async (userIds: number[]) => {
    try {
      return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/users`, {'ids': userIds});
    } catch (error: any) {
      throw {
        status: error.response?.status || 500,
        data: error.response?.data || "Error al eliminar usuarios.",
      };
    }
};

export const activateDevice = async (data: any) => {
  try {
    return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/activate_device`, data);
  } catch (error: any) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Error al activar dispositivo.",
    };
  }
};
