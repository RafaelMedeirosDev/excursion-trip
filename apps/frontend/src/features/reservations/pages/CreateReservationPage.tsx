import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { useBoardingPoints } from "@/features/boardingPoints/hooks/useBoardingPoints";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useEvents } from "@/features/events/hooks/useEvents";
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";
import { useCreateReservation } from "@/features/reservations/hooks/useCreateReservation";
import {
  createReservationSchema,
  type CreateReservationInput,
} from "@/features/reservations/validations/reservationSchema";

const AVAILABLE_STATUSES = ["PLANNING", "OPEN"];
const NO_BOARDING_POINT = "none";

export function CreateReservationPage() {
  const navigate = useNavigate();
  const createReservation = useCreateReservation();
  const { data: customers } = useCustomers();
  const { data: vehicleBookings } = useVehicleBookings();
  const { data: boardingPoints } = useBoardingPoints();
  const { data: events } = useEvents();

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));

  const availableVehicleBookings = vehicleBookings?.filter((vehicleBooking) =>
    AVAILABLE_STATUSES.includes(vehicleBooking.excursion.status),
  );

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: { boardingPointId: NO_BOARDING_POINT },
  });

  const selectedVehicleBookingId = useWatch({
    control,
    name: "vehicleBookingId",
  });

  const availableBoardingPoints = boardingPoints?.filter(
    (boardingPoint) =>
      boardingPoint.vehicleBookingId === selectedVehicleBookingId,
  );

  async function onSubmit(data: CreateReservationInput) {
    const reservation = await createReservation.mutateAsync({
      customerId: data.customerId,
      vehicleBookingId: data.vehicleBookingId,
      boardingPointId:
        data.boardingPointId && data.boardingPointId !== NO_BOARDING_POINT
          ? data.boardingPointId
          : undefined,
      agreedValue: Math.round(Number(data.agreedValue) * 100),
    });
    navigate(`/reservations/${reservation.id}`, { replace: true });
  }

  const status = isAxiosError(createReservation.error)
    ? createReservation.error.response?.status
    : undefined;

  return (
    <div>
      <PageTitle
        title="Nova Reserva"
        description="Reserve um veículo pra um cliente."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customerId">Cliente</Label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="customerId">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerId && (
                <p className="text-sm text-destructive">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="vehicleBookingId">Veículo</Label>
              <Controller
                name="vehicleBookingId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("boardingPointId", NO_BOARDING_POINT);
                    }}
                  >
                    <SelectTrigger id="vehicleBookingId">
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicleBookings?.map((vehicleBooking) => (
                        <SelectItem
                          key={vehicleBooking.id}
                          value={vehicleBooking.id}
                        >
                          {vehicleBooking.vehicleType}
                          {vehicleBooking.plate
                            ? ` — ${vehicleBooking.plate}`
                            : ""}{" "}
                          ({vehicleBooking.excursion.name}
                          {eventNameById.get(vehicleBooking.excursion.eventId)
                            ? ` — ${eventNameById.get(vehicleBooking.excursion.eventId)}`
                            : ""}
                          )
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
              <Label htmlFor="boardingPointId">Ponto de embarque</Label>
              <Controller
                name="boardingPointId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || NO_BOARDING_POINT}
                    onValueChange={field.onChange}
                    disabled={!selectedVehicleBookingId}
                  >
                    <SelectTrigger id="boardingPointId">
                      <SelectValue placeholder="Selecione um ponto de embarque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_BOARDING_POINT}>
                        Nenhum
                      </SelectItem>
                      {availableBoardingPoints?.map((boardingPoint) => (
                        <SelectItem
                          key={boardingPoint.id}
                          value={boardingPoint.id}
                        >
                          {boardingPoint.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.boardingPointId && (
                <p className="text-sm text-destructive">
                  {errors.boardingPointId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="agreedValue">Valor combinado (R$)</Label>
              <Input
                id="agreedValue"
                type="number"
                min="0"
                step="0.01"
                {...register("agreedValue")}
              />
              {errors.agreedValue && (
                <p className="text-sm text-destructive">
                  {errors.agreedValue.message}
                </p>
              )}
            </div>

            {createReservation.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {status === 409
                  ? "Esse cliente já tem uma reserva ativa pra esse evento."
                  : status === 400
                    ? "Esse veículo não está disponível pra novas reservas."
                    : "Não foi possível criar a reserva. Confira os dados e tente de novo."}
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
