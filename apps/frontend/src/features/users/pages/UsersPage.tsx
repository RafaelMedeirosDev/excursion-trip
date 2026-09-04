import { Pencil, Plus, UserCog } from "lucide-react";
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
import { ROLE_LABELS } from "@excursion-trip/shared";
import { usePaginatedUsers } from "@/features/users/hooks/usePaginatedUsers";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function UsersPage() {
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

  const { data: result, isLoading } = usePaginatedUsers({
    query: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const users = result?.data;
  const totalPages = result ? Math.max(Math.ceil(result.total / result.limit), 1) : 1;
  const hasActiveFilter = query !== "";

  return (
    <div>
      <PageTitle
        title="Usuários"
        description="Usuários com acesso à sua organização."
        action={
          <Button asChild>
            <Link to="/users/new">
              <Plus className="mr-2 size-4" />
              Novo Usuário
            </Link>
          </Button>
        }
      />

      <div className="mb-4 w-full sm:w-80">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, CPF ou e-mail"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && users && users.length === 0 && (
        <EmptyState
          icon={UserCog}
          title="Nenhum usuário cadastrado"
          description={
            hasActiveFilter
              ? "Nenhum usuário encontrado com esse filtro."
              : "Crie o primeiro usuário da sua organização."
          }
          action={
            !hasActiveFilter ? (
              <Button asChild>
                <Link to="/users/new">
                  <Plus className="mr-2 size-4" />
                  Novo Usuário
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && users && users.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="w-0 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        to={`/users/${user.id}`}
                        className="font-medium hover:underline"
                      >
                        {user.name}
                      </Link>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="size-9"
                      >
                        <Link
                          to={`/users/${user.id}/edit`}
                          aria-label="Editar usuário"
                          title="Editar usuário"
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/users/${user.id}`}
                      className="font-medium hover:underline"
                    >
                      {user.name}
                    </Link>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0"
                    >
                      <Link
                        to={`/users/${user.id}/edit`}
                        aria-label="Editar usuário"
                        title="Editar usuário"
                      >
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <CardField label="E-mail" value={user.email} />
                    <CardField label="CPF" value={user.cpf} />
                    <CardField label="Perfil" value={ROLE_LABELS[user.role]} />
                    <CardField label="Telefone" value={user.phone} />
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
