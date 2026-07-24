import { Bus, CreditCard, Route as RouteIcon, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/layout/PageTitle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEvents } from "@/features/events/hooks/useEvents";
import { useExcursions } from "@/features/excursions/hooks/useExcursions";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { useReservations } from "@/features/reservations/hooks/useReservations";
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";

function vehicleLabel(vehicleType: string, plate: string | null) {
  return plate ? `${vehicleType} — ${plate}` : vehicleType;
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const isEmployee = !hasRole("ADM");
  const { data: vehicleBookings, isLoading } = useVehicleBookings();
  const { data: events } = useEvents();
  const { data: reservations } = useReservations();
  const { data: openExcursions } = useExcursions("OPEN");
  const { data: payments } = usePayments();

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));

  const totalRevenue =
    payments?.reduce(
      (sum, payment) =>
        sum + (payment.type === "REVERSAL" ? -payment.value : payment.value),
      0,
    ) ?? 0;

  const reservationCountByStatus = {
    WAITLIST: 0,
    PENDING: 0,
    CONFIRMED: 0,
  };
  reservations?.forEach((reservation) => {
    if (reservation.status in reservationCountByStatus) {
      reservationCountByStatus[
        reservation.status as keyof typeof reservationCountByStatus
      ]++;
    }
  });

  const activeVehicleCount =
    vehicleBookings?.filter(
      (vehicleBooking) =>
        vehicleBooking.excursion.status !== "DONE" &&
        vehicleBooking.excursion.status !== "CANCELED",
    ).length ?? 0;

  const confirmedReservationCountByVehicleId = new Map<string, number>();
  reservations?.forEach((reservation) => {
    if (reservation.status !== "CONFIRMED") return;
    confirmedReservationCountByVehicleId.set(
      reservation.vehicleBookingId,
      (confirmedReservationCountByVehicleId.get(
        reservation.vehicleBookingId,
      ) ?? 0) + 1,
    );
  });

  return (
    <div className="space-y-4">
      <PageTitle
        title="Dashboard"
        description="Visão geral da sua organização."
      />
      <p className="text-sm text-muted-foreground">
        Login funcionando — organização{" "}
        <span className="font-medium">{user?.organizationId}</span>, role{" "}
        <span className="font-medium">{user?.role}</span>.
      </p>

      {!isEmployee && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Excursões abertas
              </CardTitle>
              <RouteIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {openExcursions?.length ?? "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reservas
              </CardTitle>
              <Ticket className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lista de espera</span>
                <span className="font-medium">
                  {reservationCountByStatus.WAITLIST}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pendente</span>
                <span className="font-medium">
                  {reservationCountByStatus.PENDING}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmada</span>
                <span className="font-medium">
                  {reservationCountByStatus.CONFIRMED}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total arrecadado
              </CardTitle>
              <CreditCard className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Veículos ativos
              </CardTitle>
              <Bus className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeVehicleCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isEmployee && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meus Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {!isLoading && vehicleBookings && vehicleBookings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum veículo sob sua responsabilidade ainda.
              </p>
            )}

            {!isLoading && vehicleBookings && vehicleBookings.length > 0 && (
              <div className="space-y-3">
                {vehicleBookings.map((vehicleBooking) => (
                  <Link
                    key={vehicleBooking.id}
                    to={`/vehicles/${vehicleBooking.id}`}
                    className="flex flex-col gap-1 rounded-md border p-3 text-sm hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="font-medium">
                        {vehicleLabel(
                          vehicleBooking.vehicleType,
                          vehicleBooking.plate,
                        )}
                      </span>
                      <p className="text-muted-foreground">
                        {vehicleBooking.excursion.name} —{" "}
                        {eventNameById.get(vehicleBooking.excursion.eventId) ??
                          "—"}
                      </p>
                    </div>
                    <span className="text-muted-foreground">
                      {confirmedReservationCountByVehicleId.get(
                        vehicleBooking.id,
                      ) ?? 0}{" "}
                      de {vehicleBooking.capacity} confirmadas
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
