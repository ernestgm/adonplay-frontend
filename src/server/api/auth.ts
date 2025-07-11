import axios from "axios";
import Cookies from "js-cookie";

export const signIn = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/login`,
      { email, password }
    );
    return response.data;
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
    const token = Cookies.get("auth_token");
    if (user && token) {
      const userId = JSON.parse(user).id;
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/logout`,
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
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
