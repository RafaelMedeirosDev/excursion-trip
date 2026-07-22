import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@excursion-trip/shared";
import { isAxiosError } from "axios";
import { CreditCardIcon } from "lucide-react";
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
import { useCustomer } from "@/features/customers/hooks/useCustomer";
import { useEvent } from "@/features/events/hooks/useEvent";
import { useExcursion } from "@/features/excursions/hooks/useExcursion";
import { useVehicleBooking } from "@/features/vehicleBookings/hooks/useVehicleBooking";
import { useReservation } from "@/features/reservations/hooks/useReservation";
import { usePayment } from "@/features/payments/hooks/usePayment";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

export function PaymentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: payment, isLoading, error } = usePayment(id ?? "");
  const { data: reservation } = useReservation(payment?.reservationId ?? "");
  const { data: customer } = useCustomer(reservation?.customerId ?? "");
  const { data: vehicleBooking } = useVehicleBooking(
    reservation?.vehicleBookingId ?? "",
  );
  const { data: excursion } = useExcursion(vehicleBooking?.excursionId ?? "");
  const { data: event } = useEvent(excursion?.eventId ?? "");

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
        icon={CreditCardIcon}
        title="Pagamento não encontrado"
        description="Esse pagamento não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/payments">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <div className="space-y-4">
      <PageTitle title={PAYMENT_TYPE_LABELS[payment.type]} />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
          <Field label="Valor" value={formatCurrency(payment.value)} />
          <Field label="Método" value={PAYMENT_METHOD_LABELS[payment.method]} />
          <Field label="Data" value={formatDateTime(payment.createdAt)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {customer && reservation ? (
            <>
              <Field label="Nome" value={customer.name} />
              <Field
                label="Valor combinado da reserva"
                value={formatCurrency(reservation.agreedValue)}
              />
            </>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {event && excursion ? (
            <>
              <Field label="Evento" value={event.name} />
              <Field label="Excursão" value={excursion.name} />
            </>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
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
