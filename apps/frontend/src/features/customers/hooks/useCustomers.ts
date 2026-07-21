import { useQuery } from "@tanstack/react-query";
import { customersApi } from "@/features/customers/api/customersApi";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: customersApi.getCustomers,
  });
}
