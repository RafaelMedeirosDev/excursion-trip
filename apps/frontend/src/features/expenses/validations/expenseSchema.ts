import { z } from "zod";

export const createExpenseSchema = z.object({
  category: z.enum(["FUEL", "TOLL", "FOOD", "SUPPLIES", "OTHER"], {
    message: "Selecione uma categoria",
  }),
  // string + regex em vez de z.coerce.number(): coerce não compõe com
  // register() quando o useForm é tipado pela saída do schema (mesmo motivo
  // documentado em createVehicleBookingSchema). Convertido no onSubmit.
  value: z
    .string()
    .min(1, "Valor é obrigatório")
    .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
  description: z.string().min(1, "Descrição é obrigatória"),
  vehicleBookingId: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
