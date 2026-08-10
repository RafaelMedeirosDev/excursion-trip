import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@excursion-trip/shared";
import { CreditCard, Plus } from "lucide-react";
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
import { useEvents } from "@/features/events/hooks/useEvents";
import { useReservations } from "@/features/reservations/hooks/useReservations";
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";
import { usePaginatedPayments } from "@/features/payments/hooks/usePaginatedPayments";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function vehicleLabel(vehicleType: string, plate: string | null) {
  return plate ? `${vehicleType} — ${plate}` : vehicleType;
}

export function PaymentsPage() {
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

  const { data: result, isLoading } = usePaginatedPayments({
    query: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const { data: reservations } = useReservations();
  const { data: vehicleBookings } = useVehicleBookings();
  const { data: events } = useEvents();

  const reservationById = new Map(
    reservations?.map((reservation) => [reservation.id, reservation]),
  );

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));
  const eventNameByVehicleBookingId = new Map(
    vehicleBookings?.map((vehicleBooking) => [
      vehicleBooking.id,
      eventNameById.get(vehicleBooking.excursion.eventId) ?? "—",
    ]),
  );

  const filteredPayments = result?.data;
  const totalPages = result ? Math.max(Math.ceil(result.total / result.limit), 1) : 1;

  return (
    <div>
      <PageTitle
        title="Pagamentos"
        description="Pagamentos registrados na sua organização."
        action={
          <Button asChild>
            <Link to="/payments/new">
              <Plus className="mr-2 size-4" />
              Novo Pagamento
            </Link>
          </Button>
        }
      />

      <div className="mb-4 w-full sm:w-80">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por cliente ou evento"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && filteredPayments && filteredPayments.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="Nenhum pagamento registrado"
          description={
            query === ""
              ? "Registre o primeiro pagamento da sua organização."
              : "Nenhum pagamento encontrado com esse filtro."
          }
          action={
            query === "" ? (
              <Button asChild>
                <Link to="/payments/new">
                  <Plus className="mr-2 size-4" />
                  Novo Pagamento
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && filteredPayments && filteredPayments.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const reservation = reservationById.get(
                    payment.reservationId,
                  );

                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Link
                          to={`/payments/${payment.id}`}
                          className="font-medium hover:underline"
                        >
                          {reservation?.customer.name ?? "—"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {reservation
                          ? vehicleLabel(
                              reservation.vehicleBooking.vehicleType,
                              reservation.vehicleBooking.plate,
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {reservation
                          ? eventNameByVehicleBookingId.get(
                              reservation.vehicleBookingId,
                            ) ?? "—"
                          : "—"}
                      </TableCell>
                      <TableCell>{PAYMENT_TYPE_LABELS[payment.type]}</TableCell>
                      <TableCell>{formatCurrency(payment.value)}</TableCell>
                      <TableCell>
                        {PAYMENT_METHOD_LABELS[payment.method]}
                      </TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredPayments.map((payment) => {
              const reservation = reservationById.get(payment.reservationId);

              return (
                <Link key={payment.id} to={`/payments/${payment.id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="space-y-3 pt-6">
                      <span className="font-medium">
                        {reservation?.customer.name ?? "—"}
                      </span>

                      <div className="grid grid-cols-2 gap-3">
                        <CardField
                          label="Veículo"
                          value={
                            reservation
                              ? vehicleLabel(
                                  reservation.vehicleBooking.vehicleType,
                                  reservation.vehicleBooking.plate,
                                )
                              : "—"
                          }
                        />
                        <CardField
                          label="Evento"
                          value={
                            reservation
                              ? eventNameByVehicleBookingId.get(
                                  reservation.vehicleBookingId,
                                ) ?? "—"
                              : "—"
                          }
                        />
                        <CardField
                          label="Tipo"
                          value={PAYMENT_TYPE_LABELS[payment.type]}
                        />
                        <CardField
                          label="Valor"
                          value={formatCurrency(payment.value)}
                        />
                        <CardField
                          label="Método"
                          value={PAYMENT_METHOD_LABELS[payment.method]}
                        />
                        <CardField
                          label="Data"
                          value={formatDate(payment.createdAt)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
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
