import { Building2, Plus } from "lucide-react";
import { useState } from "react";
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
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";

export function SuppliersPage() {
  const [query, setQuery] = useState("");
  const { data: suppliers, isLoading } = useSuppliers();

  const filteredSuppliers = suppliers?.filter((supplier) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(q) ||
      supplier.cnpj.includes(q) ||
      supplier.phone.includes(q)
    );
  });

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
