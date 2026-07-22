import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS } from "@excursion-trip/shared";
import { CreditCard, Plus } from "lucide-react";
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
import { useReservations } from "@/features/reservations/hooks/useReservations";
import { usePayments } from "@/features/payments/hooks/usePayments";

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function PaymentsPage() {
  const { data: payments, isLoading } = usePayments();
  const { data: reservations } = useReservations();

  const customerNameByReservationId = new Map(
    reservations?.map((reservation) => [
      reservation.id,
      reservation.customer.name,
    ]),
  );

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

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && payments && payments.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="Nenhum pagamento registrado"
          description="Registre o primeiro pagamento da sua organização."
          action={
            <Button asChild>
              <Link to="/payments/new">
                <Plus className="mr-2 size-4" />
                Novo Pagamento
              </Link>
            </Button>
          }
        />
      )}

      {!isLoading && payments && payments.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <Link
                    to={`/payments/${payment.id}`}
                    className="font-medium hover:underline"
                  >
                    {customerNameByReservationId.get(payment.reservationId) ??
                      "—"}
                  </Link>
                </TableCell>
                <TableCell>{PAYMENT_TYPE_LABELS[payment.type]}</TableCell>
                <TableCell>{formatCurrency(payment.value)}</TableCell>
                <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
                <TableCell>{formatDate(payment.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
