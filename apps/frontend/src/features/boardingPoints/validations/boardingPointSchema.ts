import { z } from "zod";

export const createBoardingPointSchema = z.object({
  vehicleBookingId: z.string().uuid("Selecione um veículo"),
  address: z.string().min(1, "Endereço é obrigatório"),
  time: z.string().optional(),
});

export type CreateBoardingPointInput = z.infer<
  typeof createBoardingPointSchema
>;

// o veículo não é editável: mover o ponto deixaria reservas apontando para
// embarque de outro ônibus, então o formulário de edição nem tem o campo
export const updateBoardingPointSchema = createBoardingPointSchema.omit({
  vehicleBookingId: true,
});

export type UpdateBoardingPointInput = z.infer<
  typeof updateBoardingPointSchema
>;
