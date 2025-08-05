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

export const signOut = () => {
  Cookies.remove("auth_token");
  Cookies.remove("user");
};

export const getDataUserAuth = () => {
  const userAuth = typeof window !== "undefined" ? Cookies.get("user") : null;
  return userAuth ? JSON.parse(userAuth) : null;
};

export const getIsOwner = () => {
  const userAuth = getDataUserAuth();
  return (userAuth.role === "owner");
};
