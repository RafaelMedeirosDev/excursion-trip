import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  address: z.string().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

// mesma forma do create: endereço em branco é válido e, na edição, significa
// limpar o campo (vira null no payload)
export const updateSupplierSchema = createSupplierSchema;

export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
