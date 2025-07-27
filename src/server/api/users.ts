import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";

export const getUser = async (id) => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Failed to sign out.",
    };
  }
};
export const fetchUsers = async () => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/users`);
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Failed to sign out.",
    };
  }
};

export const createUser = async (user) => {
  try {
    return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/users`, user);
  } catch (error) {
    console.log(error);
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Error al crear usuario.",
    };
  }
};

export const updateUser = async (id, user) => {
  try {
    return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, user);
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Error al actualizar usuario.",
    };
  }
};

export const deleteUsersAPI = async (userIds: number[]) => {
    try {
      return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/users`, {'ids': userIds});
    } catch (error) {
      throw {
        status: error.response?.status || 500,
        data: error.response?.data || "Error al eliminar usuarios.",
      };
    }
};

export const activateDevice = async (data) => {
  try {
    return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/login-code/confirm`, data);
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Error al crear usuario.",
    };
  }
};
