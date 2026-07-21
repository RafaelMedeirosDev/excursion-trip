import { useQuery } from "@tanstack/react-query";
import { suppliersApi } from "@/features/suppliers/api/suppliersApi";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: suppliersApi.getSuppliers,
  });
}
