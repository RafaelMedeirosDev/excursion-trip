import { zodResolver } from "@hookform/resolvers/zod";
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@excursion-trip/shared";
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
import { useEvents } from "@/features/events/hooks/useEvents";
import { useReservations } from "@/features/reservations/hooks/useReservations";
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";
import { useCreatePayment } from "@/features/payments/hooks/useCreatePayment";
import { usePayments } from "@/features/payments/hooks/usePayments";
import {
  createPaymentSchema,
  type CreatePaymentInput,
} from "@/features/payments/validations/paymentSchema";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function CreatePaymentPage() {
  const navigate = useNavigate();
  const createPayment = useCreatePayment();
  const { data: reservations } = useReservations();
  const { data: payments } = usePayments();
  const { data: vehicleBookings } = useVehicleBookings();
  const { data: events } = useEvents();

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));
  const eventNameByVehicleBookingId = new Map(
    vehicleBookings?.map((vehicleBooking) => [
      vehicleBooking.id,
      eventNameById.get(vehicleBooking.excursion.eventId) ?? "—",
    ]),
  );

  const availableReservations = reservations?.filter(
    (reservation) => reservation.status !== "CANCELED",
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePaymentInput>({
    resolver: zodResolver(createPaymentSchema),
  });

  const selectedReservationId = useWatch({ control, name: "reservationId" });
  const selectedReservation = reservations?.find(
    (reservation) => reservation.id === selectedReservationId,
  );
  const paidSoFar =
    payments
      ?.filter((payment) => payment.reservationId === selectedReservationId)
      .reduce(
        (sum, payment) =>
          sum + (payment.type === "REVERSAL" ? -payment.value : payment.value),
        0,
      ) ?? 0;

  async function onSubmit(data: CreatePaymentInput) {
    const payment = await createPayment.mutateAsync({
      reservationId: data.reservationId,
      type: data.type,
      method: data.method,
      value: Math.round(Number(data.value) * 100),
    });
    navigate(`/payments/${payment.id}`, { replace: true });
  }

  return (
    <div>
      <PageTitle
        title="Novo Pagamento"
        description="Registre um pagamento ou estorno pra uma reserva."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="reservationId">Reserva</Label>
              <Controller
                name="reservationId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="reservationId">
                      <SelectValue placeholder="Selecione uma reserva" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReservations?.map((reservation) => (
                        <SelectItem key={reservation.id} value={reservation.id}>
                          {reservation.customer.name} —{" "}
                          {eventNameByVehicleBookingId.get(
                            reservation.vehicleBookingId,
                          ) ?? "—"}{" "}
                          ({formatCurrency(reservation.agreedValue)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.reservationId && (
                <p className="text-sm text-destructive">
                  {errors.reservationId.message}
                </p>
              )}
              {selectedReservation && (
                <p className="text-sm text-muted-foreground">
                  Já pago: {formatCurrency(paidSoFar)} de{" "}
                  {formatCurrency(selectedReservation.agreedValue)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYMENT">
                        {PAYMENT_TYPE_LABELS.PAYMENT}
                      </SelectItem>
                      <SelectItem value="REVERSAL">
                        {PAYMENT_TYPE_LABELS.REVERSAL}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Método</Label>
              <Controller
                name="method"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Selecione um método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">
                        {PAYMENT_METHOD_LABELS.PIX}
                      </SelectItem>
                      <SelectItem value="CASH">
                        {PAYMENT_METHOD_LABELS.CASH}
                      </SelectItem>
                      <SelectItem value="CARD">
                        {PAYMENT_METHOD_LABELS.CARD}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.method && (
                <p className="text-sm text-destructive">
                  {errors.method.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
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

            {createPayment.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                Não foi possível registrar o pagamento. Confira os dados e
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
