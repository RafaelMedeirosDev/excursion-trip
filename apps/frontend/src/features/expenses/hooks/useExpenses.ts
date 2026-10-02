import { useQuery } from "@tanstack/react-query";
import { expensesApi } from "@/features/expenses/api/expensesApi";

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: expensesApi.getExpenses,
  });
}
