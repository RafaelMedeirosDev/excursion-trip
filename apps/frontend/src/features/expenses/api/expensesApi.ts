import { httpClient } from "@/services/http/client";
import type {
  CreateExpensePayload,
  Expense,
  ExpenseWithRelations,
} from "@/features/expenses/types";

export const expensesApi = {
  getExpenses: async (): Promise<ExpenseWithRelations[]> => {
    const { data } = await httpClient.get<ExpenseWithRelations[]>("/expenses");
    return data;
  },

  createExpense: async (payload: CreateExpensePayload): Promise<Expense> => {
    const { data } = await httpClient.post<Expense>("/expenses", payload);
    return data;
  },
};
