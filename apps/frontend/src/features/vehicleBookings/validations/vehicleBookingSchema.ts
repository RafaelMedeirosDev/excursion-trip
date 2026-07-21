import { z } from "zod";

export const createVehicleBookingSchema = z.object({
  excursionId: z.string().uuid("Selecione uma excursão"),
  supplierId: z.string().uuid("Selecione um fornecedor"),
  userId: z.string().uuid("Selecione um responsável"),
  vehicleType: z.string().min(1, "Tipo do veículo é obrigatório"),
  plate: z.string().optional(),
  capacity: z
    .string()
    .min(1, "Capacidade é obrigatória")
    .regex(/^\d+$/, "Capacidade deve ser um número inteiro maior que zero"),
  value: z
    .string()
    .min(1, "Valor é obrigatório")
    .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
  price: z
    .string()
    .min(1, "Preço é obrigatório")
    .regex(/^\d+(\.\d{1,2})?$/, "Preço inválido"),
  startTime: z.string().optional(),
  returnTime: z.string().optional(),
});

export type CreateVehicleBookingInput = z.infer<
  typeof createVehicleBookingSchema
>;
