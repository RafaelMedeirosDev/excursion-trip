import { z } from "zod";

export const createReservationSchema = z.object({
  customerId: z.string().uuid("Selecione um cliente"),
  vehicleBookingId: z.string().uuid("Selecione um veículo"),
  boardingPointId: z.string().uuid().optional().or(z.literal("")),
  agreedValue: z
    .string()
    .min(1, "Valor combinado é obrigatório")
    .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
