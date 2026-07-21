import { isAxiosError } from "axios";
import { RouteOff } from "lucide-react";
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function ExcursionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: excursion, isLoading, error } = useExcursion(id ?? "");
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <PageTitle title={excursion.name} />
        <ExcursionStatusBadge status={excursion.status} />
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
