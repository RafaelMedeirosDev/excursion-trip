import { Bus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
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
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function VehicleBookingsPage() {
  const { data: vehicleBookings, isLoading } = useVehicleBookings();
  const { data: events } = useEvents();
  const { hasRole } = useAuth();
  const canCreate = hasRole("ADM");

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));

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

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && vehicleBookings && vehicleBookings.length === 0 && (
        <EmptyState
          icon={Bus}
          title="Nenhum veículo cadastrado"
          description="Reserve o primeiro veículo pra uma excursão."
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
      )}

      {!isLoading && vehicleBookings && vehicleBookings.length > 0 && (
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
              <TableHead>Preço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicleBookings.map((vehicleBooking) => (
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
                  {eventNameById.get(vehicleBooking.excursion.eventId) ?? "—"}
                </TableCell>
                <TableCell>{vehicleBooking.supplier.name}</TableCell>
                <TableCell>{vehicleBooking.user.name}</TableCell>
                <TableCell>{vehicleBooking.capacity}</TableCell>
                <TableCell>{formatCurrency(vehicleBooking.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
