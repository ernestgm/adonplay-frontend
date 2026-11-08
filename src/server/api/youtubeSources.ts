import {apiDelete, apiGet, apiPost, apiPut} from "@/server/api/apiClient";
import {isAxiosError} from "axios";

const toApiError = (error: unknown, fallback: string) => ({
  status: isAxiosError(error) ? (error.response?.status ?? 500) : 500,
  data: isAxiosError(error) ? (error.response?.data ?? fallback) : fallback,
});

export const fetchYoutubeSources = async () => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/youtube_sources`);
  } catch (error) {
    throw toApiError(error, "Error al cargar fuentes de YouTube.");
  }
};

export const fetchYoutubeSourcesByUser = async (userId: string | number) => {
  if (!userId) return [];
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/youtube_sources_by_user/${userId}`);
  } catch (error) {
    throw toApiError(error, "Error al cargar fuentes de YouTube.");
  }
};

export const getYoutubeSource = async (id: string | number) => {
  try {
    return await apiGet(`${process.env.NEXT_PUBLIC_API_URL}/youtube_sources/${id}`);
  } catch (error) {
    throw toApiError(error, "Error al cargar la fuente de YouTube.");
  }
};

export const createYoutubeSource = async (data: any) => {
  try {
    return await apiPost(`${process.env.NEXT_PUBLIC_API_URL}/youtube_sources`, data);
  } catch (error) {
    throw toApiError(error, "Error al crear la fuente de YouTube.");
  }
};

export const updateYoutubeSource = async (id: string | number, data: any) => {
  try {
    return await apiPut(`${process.env.NEXT_PUBLIC_API_URL}/youtube_sources/${id}`, data);
  } catch (error) {
    throw toApiError(error, "Error al actualizar la fuente de YouTube.");
  }
};

export const deleteYoutubeSources = async (ids: number[]) => {
  try {
    return await apiDelete(`${process.env.NEXT_PUBLIC_API_URL}/youtube_sources`, {ids});
  } catch (error) {
    throw toApiError(error, "Error al eliminar las fuentes de YouTube.");
  }
};
