import { useQuery } from "@tanstack/react-query";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => suppliersApi.getSupplierById(id),
    enabled: Boolean(id),
  });
}
