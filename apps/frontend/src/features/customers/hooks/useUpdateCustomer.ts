import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/features/customers/api/customersApi";
import type { UpdateCustomerPayload } from "@/features/customers/types";

interface Variables {
  id: string;
  payload: UpdateCustomerPayload;
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Variables) =>
      customersApi.updateCustomer(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", id] });
    },
  });
}
