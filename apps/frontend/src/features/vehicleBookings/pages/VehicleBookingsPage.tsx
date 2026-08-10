import { Bus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEvents } from "@/features/events/hooks/useEvents";
import { useReservations } from "@/features/reservations/hooks/useReservations";
import { usePaginatedVehicleBookings } from "@/features/vehicleBookings/hooks/usePaginatedVehicleBookings";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function VehicleBookingsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const [lastQuery, setLastQuery] = useState(debouncedQuery);
  if (lastQuery !== debouncedQuery) {
    setLastQuery(debouncedQuery);
    setPage(1);
  }

  const { data: result, isLoading } = usePaginatedVehicleBookings({
    query: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const { data: events } = useEvents();
  const { data: reservations } = useReservations();
  const { hasRole } = useAuth();
  const canCreate = hasRole("ADM");

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));

  const occupiedSeatsByVehicleId = new Map<string, number>();
  reservations?.forEach((reservation) => {
    if (reservation.status !== "PENDING" && reservation.status !== "CONFIRMED") {
      return;
    }
    occupiedSeatsByVehicleId.set(
      reservation.vehicleBookingId,
      (occupiedSeatsByVehicleId.get(reservation.vehicleBookingId) ?? 0) + 1,
    );
  });

  function availableSeats(vehicleBookingId: string, capacity: number) {
    const occupied = occupiedSeatsByVehicleId.get(vehicleBookingId) ?? 0;
    return Math.max(capacity - occupied, 0);
  }

  const filteredVehicleBookings = result?.data;
  const totalPages = result ? Math.max(Math.ceil(result.total / result.limit), 1) : 1;
  const hasActiveFilter = query !== "";

  return (
    <div>
      <PageTitle
        title="Veículos"
        description="Veículos reservados para as excursões."
        action={
          canCreate ? (
            <Button asChild>
              <Link to="/vehicles/new">
                <Plus className="mr-2 size-4" />
                Novo Veículo
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 w-full sm:w-80">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por evento ou responsável"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading &&
        filteredVehicleBookings &&
        filteredVehicleBookings.length === 0 && (
          <EmptyState
            icon={Bus}
            title="Nenhum veículo cadastrado"
            description={
              hasActiveFilter
                ? "Nenhum veículo encontrado com esse filtro."
                : "Reserve o primeiro veículo pra uma excursão."
            }
            action={
              canCreate && !hasActiveFilter ? (
                <Button asChild>
                  <Link to="/vehicles/new">
                    <Plus className="mr-2 size-4" />
                    Novo Veículo
                  </Link>
                </Button>
              ) : undefined
            }
          />
        )}

      {!isLoading &&
        filteredVehicleBookings &&
        filteredVehicleBookings.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Excursão</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Vagas disponíveis</TableHead>
                  <TableHead>Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicleBookings.map((vehicleBooking) => (
                  <TableRow key={vehicleBooking.id}>
                    <TableCell>
                      <Link
                        to={`/vehicles/${vehicleBooking.id}`}
                        className="font-medium hover:underline"
                      >
                        {vehicleBooking.vehicleType}
                      </Link>
                    </TableCell>
                    <TableCell>{vehicleBooking.plate ?? "—"}</TableCell>
                    <TableCell>{vehicleBooking.excursion.name}</TableCell>
                    <TableCell>
                      {eventNameById.get(vehicleBooking.excursion.eventId) ??
                        "—"}
                    </TableCell>
                    <TableCell>{vehicleBooking.supplier.name}</TableCell>
                    <TableCell>{vehicleBooking.user.name}</TableCell>
                    <TableCell>{vehicleBooking.capacity}</TableCell>
                    <TableCell>
                      {availableSeats(vehicleBooking.id, vehicleBooking.capacity)}{" "}
                      de {vehicleBooking.capacity}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(vehicleBooking.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredVehicleBookings.map((vehicleBooking) => (
              <Link
                key={vehicleBooking.id}
                to={`/vehicles/${vehicleBooking.id}`}
              >
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="space-y-3 pt-6">
                    <span className="font-medium">
                      {vehicleBooking.plate
                        ? `${vehicleBooking.vehicleType} — ${vehicleBooking.plate}`
                        : vehicleBooking.vehicleType}
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <CardField
                        label="Excursão"
                        value={vehicleBooking.excursion.name}
                      />
                      <CardField
                        label="Evento"
                        value={
                          eventNameById.get(
                            vehicleBooking.excursion.eventId,
                          ) ?? "—"
                        }
                      />
                      <CardField
                        label="Fornecedor"
                        value={vehicleBooking.supplier.name}
                      />
                      <CardField
                        label="Responsável"
                        value={vehicleBooking.user.name}
                      />
                      <CardField
                        label="Capacidade"
                        value={String(vehicleBooking.capacity)}
                      />
                      <CardField
                        label="Vagas disponíveis"
                        value={`${availableSeats(vehicleBooking.id, vehicleBooking.capacity)} de ${vehicleBooking.capacity}`}
                      />
                      <CardField
                        label="Preço"
                        value={formatCurrency(vehicleBooking.price)}
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
