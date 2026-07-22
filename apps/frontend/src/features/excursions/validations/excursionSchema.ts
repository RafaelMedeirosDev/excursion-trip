import { z } from "zod";

export const createExcursionSchema = z
  .object({
    eventId: z.string().uuid("Selecione um evento"),
    name: z.string().min(1, "Nome é obrigatório"),
    departureDate: z.string().min(1, "Data de saída é obrigatória"),
    returnDate: z.string().min(1, "Data de volta é obrigatória"),
  })
  .refine(
    (data) => new Date(data.returnDate) >= new Date(data.departureDate),
    {
      message: "Data de volta não pode ser antes da data de saída",
      path: ["returnDate"],
    },
  );

export type CreateExcursionInput = z.infer<typeof createExcursionSchema>;
