import { CalendarDays, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
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
import { usePaginatedEvents } from "@/features/events/hooks/usePaginatedEvents";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function EventsPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const [lastQuery, setLastQuery] = useState(debouncedQuery);
  if (lastQuery !== debouncedQuery) {
    setLastQuery(debouncedQuery);
    setPage(1);
  }

  const { data: result, isLoading } = usePaginatedEvents({
    name: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const filteredEvents = result?.data;
  const totalPages = result ? Math.max(Math.ceil(result.total / result.limit), 1) : 1;

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

      <div className="mb-4 w-full sm:w-80">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome do evento"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && filteredEvents && filteredEvents.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum evento cadastrado"
          description={
            query === ""
              ? "Crie o primeiro evento pra poder cadastrar excursões."
              : "Nenhum evento encontrado com esse filtro."
          }
          action={
            query === "" ? (
              <Button asChild>
                <Link to="/events/new">
                  <Plus className="mr-2 size-4" />
                  Novo Evento
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && filteredEvents && filteredEvents.length > 0 && (
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
                  <TableHead className="w-0 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
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
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="size-9"
                        >
                          <Link
                            to={`/events/${event.id}/edit`}
                            aria-label="Editar evento"
                            title="Editar evento"
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/events/${event.id}`}
                      className="font-medium hover:underline"
                    >
                      {event.name}
                    </Link>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                    >
                      <Link
                        to={`/events/${event.id}/edit`}
                        aria-label="Editar evento"
                        title="Editar evento"
                      >
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <CardField label="Cidade" value={event.city} />
                    <CardField label="UF" value={event.state} />
                    <CardField
                      label="Início"
                      value={formatDate(event.startDate)}
                    />
                    <CardField label="Fim" value={formatDate(event.endDate)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {result && result.total > result.limit && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
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
