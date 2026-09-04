import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"),
  role: z.enum(["ADM", "EMPLOYEE"], { message: "Selecione um perfil" }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Na edição a senha é opcional: em branco significa "manter a senha atual".
export const updateUserSchema = createUserSchema.extend({
  password: z
    .union([z.string().min(6, "Mínimo de 6 caracteres"), z.literal("")])
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
