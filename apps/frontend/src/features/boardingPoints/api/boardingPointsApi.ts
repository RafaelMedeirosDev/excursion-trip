import { httpClient } from "@/services/http/client";
import type {
  BoardingPoint,
  BoardingPointWithRelations,
  CreateBoardingPointPayload,
  UpdateBoardingPointPayload,
  PaginatedBoardingPoints,
} from "@/features/boardingPoints/types";

export const boardingPointsApi = {
  getBoardingPoints: async (): Promise<BoardingPointWithRelations[]> => {
    const { data } = await httpClient.get<BoardingPointWithRelations[]>(
      "/boarding-points",
    );
    return data;
  },

  getBoardingPointsPaginated: async (params: {
    address?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedBoardingPoints> => {
    const { data } = await httpClient.get<PaginatedBoardingPoints>(
      "/boarding-points/paginated",
      { params },
    );
    return data;
  },

  getBoardingPointById: async (id: string): Promise<BoardingPoint> => {
    const { data } = await httpClient.get<BoardingPoint>(
      `/boarding-points/${id}`,
    );
    return data;
  },

  createBoardingPoint: async (
    payload: CreateBoardingPointPayload,
  ): Promise<BoardingPoint> => {
    const { data } = await httpClient.post<BoardingPoint>(
      "/boarding-points",
      payload,
    );
    return data;
  },

  updateBoardingPoint: async (
    id: string,
    payload: UpdateBoardingPointPayload,
  ): Promise<BoardingPoint> => {
    const { data } = await httpClient.patch<BoardingPoint>(
      `/boarding-points/${id}`,
      payload,
    );
    return data;
  },
};
