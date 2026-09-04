import { isAxiosError } from "axios";
import { UF_LABELS } from "@excursion-trip/shared";
import { CalendarX2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/features/events/hooks/useEvent";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, error } = useEvent(id ?? "");

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
        icon={CalendarX2}
        title="Evento não encontrado"
        description="Esse evento não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/events">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div>
      <PageTitle
        title={event.name}
        description={event.city}
        action={
          <Button asChild>
            <Link to={`/events/${event.id}/edit`}>Editar</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
          <Field label="Endereço" value={event.address} />
          <Field label="Cidade" value={event.city} />
          <Field label="Estado" value={UF_LABELS[event.state]} />
          <Field label="Data de início" value={formatDate(event.startDate)} />
          <Field label="Data de término" value={formatDate(event.endDate)} />
          <Field label="Horário de início" value={event.startTime} />
          <Field label="Horário de término" value={event.endTime} />
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
