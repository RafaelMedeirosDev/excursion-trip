import { isAxiosError } from "axios";
import { TicketX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoardingPoint } from "@/features/boardingPoints/hooks/useBoardingPoint";
import { useCustomer } from "@/features/customers/hooks/useCustomer";
import { useExcursion } from "@/features/excursions/hooks/useExcursion";
import { useEvent } from "@/features/events/hooks/useEvent";
import { useVehicleBooking } from "@/features/vehicleBookings/hooks/useVehicleBooking";
import { ReservationStatusActions } from "@/features/reservations/components/ReservationStatusActions";
import { ReservationStatusBadge } from "@/features/reservations/components/ReservationStatusBadge";
import { useReservation } from "@/features/reservations/hooks/useReservation";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ReservationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: reservation, isLoading, error } = useReservation(id ?? "");
  const { data: customer } = useCustomer(reservation?.customerId ?? "");
  const { data: vehicleBooking } = useVehicleBooking(
    reservation?.vehicleBookingId ?? "",
  );
  const { data: excursion } = useExcursion(vehicleBooking?.excursionId ?? "");
  const { data: event } = useEvent(excursion?.eventId ?? "");
  const { data: boardingPoint } = useBoardingPoint(
    reservation?.boardingPointId ?? "",
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isAxiosError(error) && error.response?.status === 404) {
    return (
      <EmptyState
        icon={TicketX}
        title="Reserva não encontrada"
        description="Essa reserva não existe ou foi removida."
        action={
          <Button asChild variant="outline">
            <Link to="/reservations">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!reservation) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <PageTitle title="Reserva" />
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
          <Field
            label="Valor combinado"
            value={formatCurrency(reservation.agreedValue)}
          />
          {reservation.cancelReason && (
            <Field
              label="Motivo do cancelamento"
              value={reservation.cancelReason}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {customer ? (
            <>
              <Field label="Nome" value={customer.name} />
              <Field label="Telefone" value={customer.phone} />
            </>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {event && excursion ? (
            <>
              <Field label="Evento" value={event.name} />
              <Field label="Excursão" value={excursion.name} />
            </>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Veículo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {vehicleBooking ? (
            <>
              <Field label="Tipo" value={vehicleBooking.vehicleType} />
              <Field label="Placa" value={vehicleBooking.plate ?? "—"} />
            </>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
        </CardContent>
      </Card>

      {reservation.boardingPointId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ponto de embarque</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {boardingPoint ? (
              <>
                <Field label="Endereço" value={boardingPoint.address} />
                <Field label="Horário" value={boardingPoint.time ?? "—"} />
              </>
            ) : (
              <Skeleton className="h-6 w-48" />
            )}
          </CardContent>
        </Card>
      )}

      <ReservationStatusActions reservation={reservation} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
