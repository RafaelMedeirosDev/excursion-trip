import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/layout/PageTitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";
import { useCreateBoardingPoint } from "@/features/boardingPoints/hooks/useCreateBoardingPoint";
import {
  createBoardingPointSchema,
  type CreateBoardingPointInput,
} from "@/features/boardingPoints/validations/boardingPointSchema";

function vehicleLabel(vehicleType: string, plate: string | null) {
  return plate ? `${vehicleType} — ${plate}` : vehicleType;
}

export function CreateBoardingPointPage() {
  const navigate = useNavigate();
  const createBoardingPoint = useCreateBoardingPoint();
  const { data: vehicleBookings } = useVehicleBookings();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBoardingPointInput>({
    resolver: zodResolver(createBoardingPointSchema),
  });

  async function onSubmit(data: CreateBoardingPointInput) {
    const boardingPoint = await createBoardingPoint.mutateAsync(data);
    navigate(`/boarding-points/${boardingPoint.id}`, { replace: true });
  }

  return (
    <div>
      <PageTitle
        title="Novo Ponto de Embarque"
        description="Associe um ponto de embarque a um veículo já reservado."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="vehicleBookingId">Veículo</Label>
              <Controller
                name="vehicleBookingId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="vehicleBookingId">
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleBookings?.map((vehicleBooking) => (
                        <SelectItem
                          key={vehicleBooking.id}
                          value={vehicleBooking.id}
                        >
                          {vehicleLabel(
                            vehicleBooking.vehicleType,
                            vehicleBooking.plate,
                          )}{" "}
                          ({vehicleBooking.excursion.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.vehicleBookingId && (
                <p className="text-sm text-destructive">
                  {errors.vehicleBookingId.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" {...register("address")} />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" {...register("time")} />
              {errors.time && (
                <p className="text-sm text-destructive">
                  {errors.time.message}
                </p>
              )}
            </div>

            {createBoardingPoint.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                Não foi possível criar o ponto de embarque. Confira os dados e
                tente de novo.
              </p>
            )}

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
