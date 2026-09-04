import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
