import { MapPin, Plus } from "lucide-react";
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
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";
import { useBoardingPoints } from "@/features/boardingPoints/hooks/useBoardingPoints";

function vehicleLabel(vehicleType: string, plate: string | null) {
  return plate ? `${vehicleType} — ${plate}` : vehicleType;
}

export function BoardingPointsPage() {
  const { data: boardingPoints, isLoading } = useBoardingPoints();
  const { data: vehicleBookings } = useVehicleBookings();

  const vehicleLabelById = new Map(
    vehicleBookings?.map((vehicleBooking) => [
      vehicleBooking.id,
      `${vehicleLabel(vehicleBooking.vehicleType, vehicleBooking.plate)} (${vehicleBooking.excursion.name})`,
    ]),
  );

  return (
    <div>
      <PageTitle
        title="Pontos de Embarque"
        description="Pontos de embarque cadastrados para os veículos."
        action={
          <Button asChild>
            <Link to="/boarding-points/new">
              <Plus className="mr-2 size-4" />
              Novo Ponto
            </Link>
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && boardingPoints && boardingPoints.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="Nenhum ponto de embarque cadastrado"
          description="Crie o primeiro ponto de embarque pra um veículo."
          action={
            <Button asChild>
              <Link to="/boarding-points/new">
                <Plus className="mr-2 size-4" />
                Novo Ponto
              </Link>
            </Button>
          }
        />
      )}

      {!isLoading && boardingPoints && boardingPoints.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endereço</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Veículo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boardingPoints.map((boardingPoint) => (
              <TableRow key={boardingPoint.id}>
                <TableCell>
                  <Link
                    to={`/boarding-points/${boardingPoint.id}`}
                    className="font-medium hover:underline"
                  >
                    {boardingPoint.address}
                  </Link>
                </TableCell>
                <TableCell>{boardingPoint.time ?? "—"}</TableCell>
                <TableCell>
                  {vehicleLabelById.get(boardingPoint.vehicleBookingId) ??
                    vehicleLabel(
                      boardingPoint.vehicleBooking.vehicleType,
                      boardingPoint.vehicleBooking.plate,
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
