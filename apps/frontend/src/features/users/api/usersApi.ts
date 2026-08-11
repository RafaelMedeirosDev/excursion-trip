import { httpClient } from "@/services/http/client";
import type {
  CreateUserPayload,
  PaginatedUsers,
  User,
} from "@/features/users/types";

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await httpClient.get<User[]>("/users");
    return data;
  },

  getUsersPaginated: async (params: {
    query?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedUsers> => {
    const { data } = await httpClient.get<PaginatedUsers>("/users/paginated", {
      params,
    });
    return data;
  },

  getUserById: async (id: string): Promise<User> => {
    const { data } = await httpClient.get<User>(`/users/${id}`);
    return data;
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await httpClient.post<User>("/users", payload);
    return data;
  },
};
