import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/features/customers/api/customersApi";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
