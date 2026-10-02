import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/features/expenses/api/expensesApi";

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expensesApi.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
