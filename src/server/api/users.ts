import axios from "axios";
import Cookies from "js-cookie";

export const fetchUsers = async () => {
  try {
    const token = Cookies.get("auth_token");
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status || 500,
      data: error.response?.data || "Failed to sign out.",
    };
  }
};
