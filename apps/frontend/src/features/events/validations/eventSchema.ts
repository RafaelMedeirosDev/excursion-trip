import { z } from "zod";

export const createEventSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    address: z.string().min(1, "Endereço é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.enum(
      [
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
        "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
        "RR", "SC", "SP", "SE", "TO",
      ],
      { message: "Selecione um estado" },
    ),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().min(1, "Data de término é obrigatória"),
    startTime: z.string().min(1, "Horário de início é obrigatório"),
    endTime: z.string().min(1, "Horário de término é obrigatório"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "Data de término não pode ser antes da data de início",
    path: ["endDate"],
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;

// o formulário de edição envia o objeto inteiro, então reaproveita o schema de
// criação — inclusive o .refine() que compara término contra início
export const updateEventSchema = createEventSchema;

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
