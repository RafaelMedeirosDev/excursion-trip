import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
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
import { isAxiosError } from "axios";
import { useDeleteSupplier } from "@/features/suppliers/hooks/useDeleteSupplier";
import { usePaginatedSuppliers } from "@/features/suppliers/hooks/usePaginatedSuppliers";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function SuppliersPage() {
  const deleteSupplier = useDeleteSupplier();
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

  // excluir o último item de uma página > 1 deixaria a lista vazia com os
  // controles de paginação ativos; volta uma página nesse caso
  if (filteredSuppliers && filteredSuppliers.length === 0 && page > 1) {
    setPage((current) => current - 1);
  }
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

      {deleteSupplier.isError && (
        <p className="mb-4 text-sm text-destructive">
          {isAxiosError(deleteSupplier.error) &&
          deleteSupplier.error.response?.data?.error ===
            "supplier_has_upcoming_vehicle_bookings"
            ? "Esse fornecedor tem veículo contratado em uma excursão que ainda não aconteceu. Remova o veículo antes de excluir."
            : "Não foi possível excluir o fornecedor. Tente de novo."}
        </p>
      )}

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
                  <TableHead className="w-0 text-right">Ações</TableHead>
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
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="size-9"
                        >
                          <Link
                            to={`/suppliers/${supplier.id}/edit`}
                            aria-label="Editar fornecedor"
                            title="Editar fornecedor"
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <DeleteSupplierButton
                          name={supplier.name}
                          onConfirm={() => deleteSupplier.mutate(supplier.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/suppliers/${supplier.id}`}
                      className="font-medium hover:underline"
                    >
                      {supplier.name}
                    </Link>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="size-9"
                      >
                        <Link
                          to={`/suppliers/${supplier.id}/edit`}
                          aria-label="Editar fornecedor"
                          title="Editar fornecedor"
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteSupplierButton
                        name={supplier.name}
                        onConfirm={() => deleteSupplier.mutate(supplier.id)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <CardField label="CNPJ" value={supplier.cnpj} />
                    <CardField label="Telefone" value={supplier.phone} />
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

function DeleteSupplierButton({
  name,
  onConfirm,
}: {
  name: string;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="icon"
          className="size-9 text-destructive hover:text-destructive"
          aria-label="Excluir fornecedor"
          title="Excluir fornecedor"
        >
          <Trash2 className="size-4" />
        </Button>
      }
      title={`Excluir ${name}?`}
      description="O fornecedor sai da listagem, mas o histórico de veículos contratados é preservado. Cadastrar o mesmo CNPJ de novo restaura o cadastro."
      confirmLabel="Excluir"
      onConfirm={onConfirm}
    />
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
