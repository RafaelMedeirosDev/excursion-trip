import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
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
import { useExcursions } from "@/features/excursions/hooks/useExcursions";
import { useEvents } from "@/features/events/hooks/useEvents";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useCreateVehicleBooking } from "@/features/vehicleBookings/hooks/useCreateVehicleBooking";
import {
  createVehicleBookingSchema,
  type CreateVehicleBookingInput,
} from "@/features/vehicleBookings/validations/vehicleBookingSchema";

const AVAILABLE_STATUSES = ["PLANNING", "OPEN"];

export function CreateVehicleBookingPage() {
  const navigate = useNavigate();
  const createVehicleBooking = useCreateVehicleBooking();
  const { data: excursions } = useExcursions();
  const { data: events } = useEvents();
  const { data: suppliers } = useSuppliers();
  const { data: users } = useUsers();

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));

  const availableExcursions = excursions?.filter((excursion) =>
    AVAILABLE_STATUSES.includes(excursion.status),
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateVehicleBookingInput>({
    resolver: zodResolver(createVehicleBookingSchema),
  });

  async function onSubmit(data: CreateVehicleBookingInput) {
    const vehicleBooking = await createVehicleBooking.mutateAsync({
      ...data,
      capacity: Number(data.capacity),
      value: Math.round(Number(data.value) * 100),
      price: Math.round(Number(data.price) * 100),
    });
    navigate(`/vehicles/${vehicleBooking.id}`, { replace: true });
  }

  const status = isAxiosError(createVehicleBooking.error)
    ? createVehicleBooking.error.response?.status
    : undefined;

  return (
    <div>
      <PageTitle
        title="Novo Veículo"
        description="Reserve um veículo pra uma excursão em planejamento ou aberta."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="excursionId">Excursão</Label>
              <Controller
                name="excursionId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="excursionId">
                      <SelectValue placeholder="Selecione uma excursão" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExcursions?.map((excursion) => (
                        <SelectItem key={excursion.id} value={excursion.id}>
                          {excursion.name}
                          {eventNameById.get(excursion.eventId)
                            ? ` — ${eventNameById.get(excursion.eventId)}`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.excursionId && (
                <p className="text-sm text-destructive">
                  {errors.excursionId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierId">Fornecedor</Label>
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="supplierId">
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.supplierId && (
                <p className="text-sm text-destructive">
                  {errors.supplierId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">Responsável</Label>
              <Controller
                name="userId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="userId">
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.userId && (
                <p className="text-sm text-destructive">
                  {errors.userId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Tipo do veículo</Label>
              <Input id="vehicleType" {...register("vehicleType")} />
              {errors.vehicleType && (
                <p className="text-sm text-destructive">
                  {errors.vehicleType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate">Placa</Label>
              <Input id="plate" {...register("plate")} />
              {errors.plate && (
                <p className="text-sm text-destructive">
                  {errors.plate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                step="1"
                {...register("capacity")}
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">
                  {errors.capacity.message}
                </p>
              )}
            </div>

            <div />

            <div className="space-y-2">
              <Label htmlFor="value">Custo (R$)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                {...register("value")}
              />
              {errors.value && (
                <p className="text-sm text-destructive">
                  {errors.value.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço do assento (R$)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-sm text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de saída</Label>
              <Input id="startTime" type="time" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-sm text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnTime">Horário de volta</Label>
              <Input id="returnTime" type="time" {...register("returnTime")} />
              {errors.returnTime && (
                <p className="text-sm text-destructive">
                  {errors.returnTime.message}
                </p>
              )}
            </div>

            {createVehicleBooking.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {status === 409
                  ? "Já existe um veículo com essa placa nessa excursão."
                  : status === 400
                    ? "Essa excursão não está disponível para novos veículos."
                    : "Não foi possível criar o veículo. Confira os dados e tente de novo."}
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
