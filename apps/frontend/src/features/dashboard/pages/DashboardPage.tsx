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
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";

function vehicleLabel(vehicleType: string, plate: string | null) {
  return plate ? `${vehicleType} — ${plate}` : vehicleType;
}

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const isEmployee = !hasRole("ADM");
  const { data: vehicleBookings, isLoading } = useVehicleBookings();
  const { data: events } = useEvents();

  const eventNameById = new Map(events?.map((event) => [event.id, event.name]));

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
                    <span className="font-medium">
                      {vehicleLabel(
                        vehicleBooking.vehicleType,
                        vehicleBooking.plate,
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      {vehicleBooking.excursion.name} —{" "}
                      {eventNameById.get(vehicleBooking.excursion.eventId) ??
                        "—"}
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
