import { z } from "zod";

export const createBoardingPointSchema = z.object({
  vehicleBookingId: z.string().uuid("Selecione um veículo"),
  address: z.string().min(1, "Endereço é obrigatório"),
  time: z.string().optional(),
});

export type CreateBoardingPointInput = z.infer<
  typeof createBoardingPointSchema
>;
