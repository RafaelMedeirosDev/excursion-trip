import { Building2, Plus } from "lucide-react";
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
import { usePaginatedSuppliers } from "@/features/suppliers/hooks/usePaginatedSuppliers";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function SuppliersPage() {
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

  const { data: result, isLoading } = usePaginatedSuppliers({
    query: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const filteredSuppliers = result?.data;
  const totalPages = result ? Math.max(Math.ceil(result.total / result.limit), 1) : 1;

  return (
    <div>
      <PageTitle
        title="Fornecedores"
        description="Fornecedores de veículos cadastrados na sua organização."
        action={
          <Button asChild>
            <Link to="/suppliers/new">
              <Plus className="mr-2 size-4" />
              Novo Fornecedor
            </Link>
          </Button>
        }
      />

      <div className="mb-4 w-full sm:w-80">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, CNPJ ou telefone"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && filteredSuppliers && filteredSuppliers.length === 0 && (
        <EmptyState
          icon={Building2}
          title="Nenhum fornecedor cadastrado"
          description={
            query === ""
              ? "Crie o primeiro fornecedor pra poder cadastrar veículos."
              : "Nenhum fornecedor encontrado com esse filtro."
          }
          action={
            query === "" ? (
              <Button asChild>
                <Link to="/suppliers/new">
                  <Plus className="mr-2 size-4" />
                  Novo Fornecedor
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && filteredSuppliers && filteredSuppliers.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        className="font-medium hover:underline"
                      >
                        {supplier.name}
                      </Link>
                    </TableCell>
                    <TableCell>{supplier.cnpj}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredSuppliers.map((supplier) => (
              <Link key={supplier.id} to={`/suppliers/${supplier.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="space-y-3 pt-6">
                    <span className="font-medium">{supplier.name}</span>

                    <div className="grid grid-cols-2 gap-3">
                      <CardField label="CNPJ" value={supplier.cnpj} />
                      <CardField label="Telefone" value={supplier.phone} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
