import Cookies from "js-cookie";
import {apiPost} from "@/server/api/apiClient";

export const signIn = async (email: string, password: string) => {
  try {
    return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/login`, {email, password}, {}, true);
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Failed to sign in.",
    };
  }
};

export const signOut = async () => {
  let caughtError = null; // Variable para almacenar el error

  try {
    const user = Cookies.get("user");
    if (user) {
      const userId = JSON.parse(user).id;
      await apiPost(
        `${process.env.NEXT_PUBLIC_API_URL}/logout`,
        { id: userId }
      );
    }
  } catch (error) {
    console.error("Error during sign out:", error);
    caughtError = error; // Asignar el error a la variable
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Failed to sign out.",
    };
  } finally {
    if (!caughtError || caughtError.response?.status === 200) {
      Cookies.remove("auth_token");
      Cookies.remove("user");
    }
  }
};
