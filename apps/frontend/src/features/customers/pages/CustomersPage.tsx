import { Pencil, Plus, UserRound } from "lucide-react";
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
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePaginatedCustomers } from "@/features/customers/hooks/usePaginatedCustomers";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function CustomersPage() {
  const { hasRole } = useAuth();
  // listagem aberta, edição restrita: mesmo gate por papel já usado pro botão
  // "Novo X" em VehicleBookingsPage/BoardingPointsPage
  const canEdit = hasRole("ADM");
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

  const { data: result, isLoading } = usePaginatedCustomers({
    query: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const filteredCustomers = result?.data;
  const totalPages = result ? Math.max(Math.ceil(result.total / result.limit), 1) : 1;

  return (
    <div>
      <PageTitle
        title="Passageiros"
        description="Clientes cadastrados na sua organização."
        action={
          <Button asChild>
            <Link to="/passengers/new">
              <Plus className="mr-2 size-4" />
              Novo Passageiro
            </Link>
          </Button>
        }
      />

      <div className="mb-4 w-full sm:w-80">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome ou CPF"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && filteredCustomers && filteredCustomers.length === 0 && (
        <EmptyState
          icon={UserRound}
          title="Nenhum passageiro cadastrado"
          description={
            query === ""
              ? "Crie o primeiro passageiro da sua organização."
              : "Nenhum passageiro encontrado com esse filtro."
          }
          action={
            query === "" ? (
              <Button asChild>
                <Link to="/passengers/new">
                  <Plus className="mr-2 size-4" />
                  Novo Passageiro
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && filteredCustomers && filteredCustomers.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>E-mail</TableHead>
                  {canEdit && (
                    <TableHead className="w-0 text-right">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link
                        to={`/passengers/${customer.id}`}
                        className="font-medium hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.cpf}</TableCell>
                    <TableCell>{customer.email ?? "—"}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="size-9"
                          >
                            <Link
                              to={`/passengers/${customer.id}/edit`}
                              aria-label="Editar passageiro"
                              title="Editar passageiro"
                            >
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/passengers/${customer.id}`}
                      className="font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>
                    {canEdit && (
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="size-9 shrink-0"
                      >
                        <Link
                          to={`/passengers/${customer.id}/edit`}
                          aria-label="Editar passageiro"
                          title="Editar passageiro"
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <CardField label="Telefone" value={customer.phone} />
                    <CardField label="CPF" value={customer.cpf} />
                    <CardField label="E-mail" value={customer.email ?? "—"} />
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
