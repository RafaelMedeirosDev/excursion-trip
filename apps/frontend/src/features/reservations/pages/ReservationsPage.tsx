import type { ReservationStatus } from "@excursion-trip/shared";
import { Plus, Ticket } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageTitle } from "@/components/layout/PageTitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEvents } from "@/features/events/hooks/useEvents";
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";
import { ReservationStatusBadge } from "@/features/reservations/components/ReservationStatusBadge";
import { STATUS_LABELS } from "@/features/reservations/constants";
import { useReservations } from "@/features/reservations/hooks/useReservations";

const STATUS_FILTERS: ReservationStatus[] = [
  "WAITLIST",
  "PENDING",
  "CONFIRMED",
  "CANCELED",
];

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">(
    "ALL",
  );
  const [eventFilter, setEventFilter] = useState<string>("ALL");
  const { data: reservations, isLoading } = useReservations(
    statusFilter === "ALL" ? undefined : statusFilter,
  );
  const { data: vehicleBookings } = useVehicleBookings();
  const { data: events } = useEvents();

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));
  const eventNameByVehicleBookingId = new Map(
    vehicleBookings?.map((vehicleBooking) => [
      vehicleBooking.id,
      eventNameById.get(vehicleBooking.excursion.eventId) ?? "—",
    ]),
  );
  const eventIdByVehicleBookingId = new Map(
    vehicleBookings?.map((vehicleBooking) => [
      vehicleBooking.id,
      vehicleBooking.excursion.eventId,
    ]),
  );

  const filteredReservations = reservations?.filter(
    (reservation) =>
      eventFilter === "ALL" ||
      eventIdByVehicleBookingId.get(reservation.vehicleBookingId) ===
        eventFilter,
  );
  const hasActiveFilter = statusFilter !== "ALL" || eventFilter !== "ALL";

  return (
    <div>
      <PageTitle
        title="Reservas"
        description="Reservas registradas na sua organização."
        action={
          <Button asChild>
            <Link to="/reservations/new">
              <Plus className="mr-2 size-4" />
              Nova Reserva
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="w-48">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as ReservationStatus | "ALL")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              {STATUS_FILTERS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os eventos</SelectItem>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && filteredReservations && filteredReservations.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="Nenhuma reserva encontrada"
          description={
            hasActiveFilter
              ? "Nenhuma reserva encontrada com esse filtro."
              : "Crie a primeira reserva da sua organização."
          }
          action={
            hasActiveFilter ? undefined : (
              <Button asChild>
                <Link to="/reservations/new">
                  <Plus className="mr-2 size-4" />
                  Nova Reserva
                </Link>
              </Button>
            )
          }
        />
      )}

      {!isLoading && filteredReservations && filteredReservations.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Ponto de embarque</TableHead>
              <TableHead>Valor combinado</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>
                  <Link
                    to={`/reservations/${reservation.id}`}
                    className="font-medium hover:underline"
                  >
                    {reservation.customer.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {eventNameByVehicleBookingId.get(
                    reservation.vehicleBookingId,
                  ) ?? "—"}
                </TableCell>
                <TableCell>
                  {reservation.vehicleBooking.vehicleType}
                  {reservation.vehicleBooking.plate
                    ? ` — ${reservation.vehicleBooking.plate}`
                    : ""}
                </TableCell>
                <TableCell>
                  {reservation.boardingPoint?.address ?? "—"}
                </TableCell>
                <TableCell>{formatCurrency(reservation.agreedValue)}</TableCell>
                <TableCell>
                  <ReservationStatusBadge status={reservation.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
