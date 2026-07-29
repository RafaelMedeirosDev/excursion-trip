import { isAxiosError } from "axios";
import { BusFront } from "lucide-react";
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
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useExcursion } from "@/features/excursions/hooks/useExcursion";
import { useEvent } from "@/features/events/hooks/useEvent";
import { ReservationStatusBadge } from "@/features/reservations/components/ReservationStatusBadge";
import { useReservations } from "@/features/reservations/hooks/useReservations";
import { useSupplier } from "@/features/suppliers/hooks/useSupplier";
import { useUser } from "@/features/users/hooks/useUser";
import { useVehicleBooking } from "@/features/vehicleBookings/hooks/useVehicleBooking";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function VehicleBookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { data: vehicleBooking, isLoading, error } = useVehicleBooking(id ?? "");
  const { data: excursion } = useExcursion(vehicleBooking?.excursionId ?? "");
  const { data: event } = useEvent(excursion?.eventId ?? "");
  const { data: supplier } = useSupplier(vehicleBooking?.supplierId ?? "");
  const { data: user } = useUser(vehicleBooking?.userId ?? "");
  const { data: reservations } = useReservations(undefined, vehicleBooking?.id, {
    enabled: Boolean(vehicleBooking),
  });

  const occupiedSeats =
    reservations?.filter(
      (reservation) =>
        reservation.status === "PENDING" || reservation.status === "CONFIRMED",
    ).length ?? 0;

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
        icon={BusFront}
        title="Veículo não encontrado"
        description="Esse veículo não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/vehicles">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!vehicleBooking) {
    return null;
  }

  return (
    <div className="space-y-4">
      <PageTitle title={vehicleBooking.vehicleType} />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
          <Field label="Placa" value={vehicleBooking.plate ?? "—"} />
          <Field label="Capacidade" value={String(vehicleBooking.capacity)} />
          <Field
            label="Vagas disponíveis"
            value={`${Math.max(vehicleBooking.capacity - occupiedSeats, 0)} de ${vehicleBooking.capacity}`}
          />
          {hasRole("ADM") && (
            <Field label="Custo" value={formatCurrency(vehicleBooking.value)} />
          )}
          <Field label="Preço do assento" value={formatCurrency(vehicleBooking.price)} />
          <Field label="Horário de saída" value={vehicleBooking.startTime ?? "—"} />
          <Field label="Horário de volta" value={vehicleBooking.returnTime ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Excursão</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {excursion ? (
            <>
              <Field label="Nome" value={excursion.name} />
              <Field label="Evento" value={event?.name ?? "—"} />
            </>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fornecedor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {supplier ? (
            <>
              <Field label="Nome" value={supplier.name} />
              <Field label="Telefone" value={supplier.phone} />
            </>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Responsável</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {user ? (
            <>
              <Field label="Nome" value={user.name} />
              <Field label="Telefone" value={user.phone} />
            </>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {!reservations ? (
            <Skeleton className="h-6 w-48" />
          ) : reservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma reserva pra esse veículo ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <Link
                  key={reservation.id}
                  to={`/reservations/${reservation.id}`}
                  className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {reservation.customer.name}
                    </span>
                    <ReservationStatusBadge status={reservation.status} />
                  </div>
                  <span className="text-muted-foreground">
                    {formatCurrency(reservation.agreedValue)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
