import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suppliersApi.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
