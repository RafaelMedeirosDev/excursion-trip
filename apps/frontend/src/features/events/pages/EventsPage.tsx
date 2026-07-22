import { CalendarDays, Plus } from "lucide-react";
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
import { useEvents } from "@/features/events/hooks/useEvents";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function EventsPage() {
  const { data: events, isLoading } = useEvents();

  return (
    <div>
      <PageTitle
        title="Eventos"
        description="Eventos que servem de base pras excursões."
        action={
          <Button asChild>
            <Link to="/events/new">
              <Plus className="mr-2 size-4" />
              Novo Evento
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

      {!isLoading && events && events.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum evento cadastrado"
          description="Crie o primeiro evento pra poder cadastrar excursões."
          action={
            <Button asChild>
              <Link to="/events/new">
                <Plus className="mr-2 size-4" />
                Novo Evento
              </Link>
            </Button>
          }
        />
      )}

      {!isLoading && events && events.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>UF</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <Link
                    to={`/events/${event.id}`}
                    className="font-medium hover:underline"
                  >
                    {event.name}
                  </Link>
                </TableCell>
                <TableCell>{event.city}</TableCell>
                <TableCell>{event.state}</TableCell>
                <TableCell>{formatDate(event.startDate)}</TableCell>
                <TableCell>{formatDate(event.endDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
