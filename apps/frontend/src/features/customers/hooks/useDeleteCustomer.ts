import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/features/customers/api/customersApi";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
