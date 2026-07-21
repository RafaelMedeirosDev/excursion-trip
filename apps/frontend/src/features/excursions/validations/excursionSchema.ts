import { z } from "zod";

export const createExcursionSchema = z.object({
  eventId: z.string().uuid("Selecione um evento"),
  name: z.string().min(1, "Nome é obrigatório"),
  departureDate: z.string().min(1, "Data de saída é obrigatória"),
  returnDate: z.string().min(1, "Data de volta é obrigatória"),
});

export type CreateExcursionInput = z.infer<typeof createExcursionSchema>;
