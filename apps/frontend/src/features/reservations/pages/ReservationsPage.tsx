import type { ReservationStatus } from "@excursion-trip/shared";
import { Plus, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
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
import { usePaginatedReservations } from "@/features/reservations/hooks/usePaginatedReservations";

const STATUS_FILTERS: ReservationStatus[] = [
  "WAITLIST",
  "PENDING",
  "CONFIRMED",
  "CANCELED",
];

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

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
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const [lastFilters, setLastFilters] = useState({ statusFilter, debouncedQuery });
  if (
    lastFilters.statusFilter !== statusFilter ||
    lastFilters.debouncedQuery !== debouncedQuery
  ) {
    setLastFilters({ statusFilter, debouncedQuery });
    setPage(1);
  }

  const { data: result, isLoading } = usePaginatedReservations({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    eventName: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const { data: vehicleBookings } = useVehicleBookings();
  const { data: events } = useEvents();

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));
  const eventNameByVehicleBookingId = new Map(
    vehicleBookings?.map((vehicleBooking) => [
      vehicleBooking.id,
      eventNameById.get(vehicleBooking.excursion.eventId) ?? "—",
    ]),
  );

  const reservations = result?.data;
  const totalPages = result ? Math.max(Math.ceil(result.total / result.limit), 1) : 1;
  const hasActiveFilter = statusFilter !== "ALL" || query !== "";

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

        <div className="w-full sm:w-64">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por evento"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && reservations && reservations.length === 0 && (
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

      {!isLoading && reservations && reservations.length > 0 && (
        <>
          <div className="hidden md:block">
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
                {reservations.map((reservation) => (
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
                    <TableCell>
                      {formatCurrency(reservation.agreedValue)}
                    </TableCell>
                    <TableCell>
                      <ReservationStatusBadge status={reservation.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {reservations.map((reservation) => (
              <Link key={reservation.id} to={`/reservations/${reservation.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {reservation.customer.name}
                      </span>
                      <ReservationStatusBadge status={reservation.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <CardField
                        label="Evento"
                        value={
                          eventNameByVehicleBookingId.get(
                            reservation.vehicleBookingId,
                          ) ?? "—"
                        }
                      />
                      <CardField
                        label="Veículo"
                        value={
                          reservation.vehicleBooking.plate
                            ? `${reservation.vehicleBooking.vehicleType} — ${reservation.vehicleBooking.plate}`
                            : reservation.vehicleBooking.vehicleType
                        }
                      />
                      <CardField
                        label="Ponto de embarque"
                        value={reservation.boardingPoint?.address ?? "—"}
                      />
                      <CardField
                        label="Valor combinado"
                        value={formatCurrency(reservation.agreedValue)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {result && result.total > result.limit && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
