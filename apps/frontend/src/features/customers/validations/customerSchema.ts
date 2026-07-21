import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().min(1, "Telefone é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
