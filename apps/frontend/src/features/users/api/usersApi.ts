import { httpClient } from "@/services/http/client";
import type { CreateUserPayload, User } from "@/features/users/types";

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await httpClient.get<User[]>("/users");
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
