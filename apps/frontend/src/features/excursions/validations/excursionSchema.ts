import { z } from "zod";

// os campos ficam numa base sem refinamento porque o zod 4 lança em runtime no
// `.omit()` de um schema que já tem `.refine()` — e como a edição não aceita
// eventId, o refinamento de datas é aplicado depois, uma vez por schema
const excursionFields = {
  name: z.string().min(1, "Nome é obrigatório"),
  departureDate: z.string().min(1, "Data de saída é obrigatória"),
  returnDate: z.string().min(1, "Data de volta é obrigatória"),
};

const isDateRangeValid = (data: {
  departureDate: string;
  returnDate: string;
}) => new Date(data.returnDate) >= new Date(data.departureDate);

const dateRangeError = {
  message: "Data de volta não pode ser antes da data de saída",
  path: ["returnDate"],
};

export const createExcursionSchema = z
  .object({
    eventId: z.string().uuid("Selecione um evento"),
    ...excursionFields,
  })
  .refine(isDateRangeValid, dateRangeError);

// eventId de fora: trocar o evento da excursão criaria reservas duplicadas do
// mesmo passageiro no mesmo evento
export const updateExcursionSchema = z
  .object(excursionFields)
  .refine(isDateRangeValid, dateRangeError);

export type CreateExcursionInput = z.infer<typeof createExcursionSchema>;
export type UpdateExcursionInput = z.infer<typeof updateExcursionSchema>;
