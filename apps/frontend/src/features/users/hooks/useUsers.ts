import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getUsers,
  });
}
