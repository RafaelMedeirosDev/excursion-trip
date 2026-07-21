import { Building2, Plus } from "lucide-react";
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
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";

export function SuppliersPage() {
  const { data: suppliers, isLoading } = useSuppliers();

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

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && suppliers && suppliers.length === 0 && (
        <EmptyState
          icon={Building2}
          title="Nenhum fornecedor cadastrado"
          description="Crie o primeiro fornecedor pra poder cadastrar veículos."
          action={
            <Button asChild>
              <Link to="/suppliers/new">
                <Plus className="mr-2 size-4" />
                Novo Fornecedor
              </Link>
            </Button>
          }
        />
      )}

      {!isLoading && suppliers && suppliers.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Telefone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
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
      )}
    </div>
  );
}
