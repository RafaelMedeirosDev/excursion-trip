import { useQuery } from "@tanstack/react-query";
import { customersApi } from "@/features/customers/api/customersApi";

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customersApi.getCustomerById(id),
    enabled: Boolean(id),
  });
}
