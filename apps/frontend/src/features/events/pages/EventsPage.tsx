import { CalendarDays, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <>
          <div className="hidden md:block">
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
          </div>

          <div className="grid gap-3 md:hidden">
            {events.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="space-y-3 pt-6">
                    <span className="font-medium">{event.name}</span>

                    <div className="grid grid-cols-2 gap-3">
                      <CardField label="Cidade" value={event.city} />
                      <CardField label="UF" value={event.state} />
                      <CardField
                        label="Início"
                        value={formatDate(event.startDate)}
                      />
                      <CardField
                        label="Fim"
                        value={formatDate(event.endDate)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
