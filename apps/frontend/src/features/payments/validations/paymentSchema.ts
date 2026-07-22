import { z } from "zod";

export const createPaymentSchema = z.object({
  reservationId: z.string().uuid("Selecione uma reserva"),
  type: z.enum(["PAYMENT", "REVERSAL"], { message: "Selecione um tipo" }),
  method: z.enum(["PIX", "CASH", "CARD"], { message: "Selecione um método" }),
  value: z
    .string()
    .min(1, "Valor é obrigatório")
    .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
