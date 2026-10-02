import { EXPENSE_CATEGORY_LABELS } from "@excursion-trip/shared";
import { isAxiosError } from "axios";
import { Plus, RouteOff } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/features/events/hooks/useEvent";
import { ExcursionStatusActions } from "@/features/excursions/components/ExcursionStatusActions";
import { ExcursionStatusBadge } from "@/features/excursions/components/ExcursionStatusBadge";
import { useExcursion } from "@/features/excursions/hooks/useExcursion";
import { NON_EDITABLE_STATUSES } from "@/features/excursions/constants";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ExcursionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: excursion, isLoading, error } = useExcursion(id ?? "");
  const { data: event } = useEvent(excursion?.eventId ?? "");
  // GET /expenses não aceita filtro, então a lista vem inteira e é recortada
  // aqui (mesmo caminho que PaymentsPage já usa pro filtro por evento)
  const { data: allExpenses } = useExpenses();
  const expenses = allExpenses?.filter(
    (expense) => expense.excursionId === id,
  );
  const expensesTotal = expenses?.reduce(
    (total, expense) => total + expense.value,
    0,
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
        icon={RouteOff}
        title="Excursão não encontrada"
        description="Essa excursão não existe ou foi removida."
        action={
          <Button asChild variant="outline">
            <Link to="/excursions">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!excursion) {
    return null;
  }

  const canEdit = !NON_EDITABLE_STATUSES.includes(excursion.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <PageTitle title={excursion.name} />
        <ExcursionStatusBadge status={excursion.status} />
        {/* estados terminais não são editáveis no backend: não oferecer a ação
            que sempre falharia */}
        {canEdit && (
          <Button asChild className="ml-auto shrink-0">
            <Link to={`/excursions/${excursion.id}/edit`}>Editar</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
          <Field label="Data de saída" value={formatDate(excursion.departureDate)} />
          <Field label="Data de volta" value={formatDate(excursion.returnDate)} />
          {excursion.cancelReason && (
            <Field
              label="Motivo do cancelamento"
              value={excursion.cancelReason}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evento</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {event ? (
            <>
              <Field label="Nome" value={event.name} />
              <Field label="Cidade" value={event.city} />
            </>
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Despesas</CardTitle>
            {expensesTotal !== undefined && (
              <p className="mt-1 text-sm text-muted-foreground">
                Total: {formatCurrency(expensesTotal)}
              </p>
            )}
          </div>
          {/* sem gate de status aqui de propósito: diferente de veículo e
              reserva, o backend libera despesa em qualquer status — combustível
              e pedágio costumam ser lançados depois da viagem */}
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to={`/excursions/${excursion.id}/expenses/new`}>
              <Plus className="mr-2 size-4" />
              Nova Despesa
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!expenses ? (
            <Skeleton className="h-6 w-48" />
          ) : expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma despesa lançada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {EXPENSE_CATEGORY_LABELS[expense.category]}
                    </p>
                    <p className="text-muted-foreground">
                      {expense.description}
                    </p>
                    {expense.vehicleBooking && (
                      <p className="text-xs text-muted-foreground">
                        {expense.vehicleBooking.vehicleType}
                        {expense.vehicleBooking.plate
                          ? ` — ${expense.vehicleBooking.plate}`
                          : ""}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    {formatCurrency(expense.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ExcursionStatusActions excursion={excursion} />
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
