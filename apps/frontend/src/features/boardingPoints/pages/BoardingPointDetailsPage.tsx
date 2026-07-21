import { isAxiosError } from "axios";
import { MapPinOff } from "lucide-react";
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
import { useVehicleBooking } from "@/features/vehicleBookings/hooks/useVehicleBooking";
import { useBoardingPoint } from "@/features/boardingPoints/hooks/useBoardingPoint";

export function BoardingPointDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: boardingPoint, isLoading, error } = useBoardingPoint(id ?? "");
  const { data: vehicleBooking } = useVehicleBooking(
    boardingPoint?.vehicleBookingId ?? "",
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
        icon={MapPinOff}
        title="Ponto de embarque não encontrado"
        description="Esse ponto de embarque não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/boarding-points">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!boardingPoint) {
    return null;
  }

  return (
    <div className="space-y-4">
      <PageTitle title={boardingPoint.address} />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
          <Field label="Endereço" value={boardingPoint.address} />
          <Field label="Horário" value={boardingPoint.time ?? "—"} />
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
