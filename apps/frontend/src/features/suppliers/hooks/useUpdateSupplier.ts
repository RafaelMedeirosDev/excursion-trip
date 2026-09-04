import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";
import type { UpdateSupplierPayload } from "@/features/suppliers/types";

interface Variables {
  id: string;
  payload: UpdateSupplierPayload;
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Variables) =>
      suppliersApi.updateSupplier(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", id] });
    },
  });
}
