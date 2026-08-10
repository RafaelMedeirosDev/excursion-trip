import { httpClient } from "@/services/http/client";
import type {
  CreateExcursionPayload,
  Excursion,
  ExcursionStatus,
  ExcursionWithEvent,
  PaginatedExcursions,
  UpdateExcursionStatusPayload,
} from "@/features/excursions/types";

export const excursionsApi = {
  getExcursions: async (
    status?: ExcursionStatus,
  ): Promise<ExcursionWithEvent[]> => {
    const { data } = await httpClient.get<ExcursionWithEvent[]>(
      "/excursions",
      {
        params: status ? { status } : undefined,
      },
    );
    return data;
  },

  getExcursionsPaginated: async (params: {
    status?: ExcursionStatus;
    eventName?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedExcursions> => {
    const { data } = await httpClient.get<PaginatedExcursions>(
      "/excursions/paginated",
      { params },
    );
    return data;
  },

  getExcursionById: async (id: string): Promise<Excursion> => {
    const { data } = await httpClient.get<Excursion>(`/excursions/${id}`);
    return data;
  },

  createExcursion: async (
    payload: CreateExcursionPayload,
  ): Promise<Excursion> => {
    const { data } = await httpClient.post<Excursion>(
      "/excursions",
      payload,
    );
    return data;
  },

  updateExcursionStatus: async (
    id: string,
    payload: UpdateExcursionStatusPayload,
  ): Promise<Excursion> => {
    const { data } = await httpClient.patch<Excursion>(
      `/excursions/${id}/status`,
      payload,
    );
    return data;
  },
};
