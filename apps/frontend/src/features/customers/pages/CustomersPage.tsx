import { Plus, UserRound } from "lucide-react";
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
import { useCustomers } from "@/features/customers/hooks/useCustomers";

export function CustomersPage() {
  const { data: customers, isLoading } = useCustomers();

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

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && customers && customers.length === 0 && (
        <EmptyState
          icon={UserRound}
          title="Nenhum passageiro cadastrado"
          description="Crie o primeiro passageiro da sua organização."
          action={
            <Button asChild>
              <Link to="/passengers/new">
                <Plus className="mr-2 size-4" />
                Novo Passageiro
              </Link>
            </Button>
          }
        />
      )}

      {!isLoading && customers && customers.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>E-mail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {customers.map((customer) => (
              <Link key={customer.id} to={`/passengers/${customer.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="space-y-3 pt-6">
                    <span className="font-medium">{customer.name}</span>

                    <div className="grid grid-cols-2 gap-3">
                      <CardField label="Telefone" value={customer.phone} />
                      <CardField label="CPF" value={customer.cpf} />
                      <CardField
                        label="E-mail"
                        value={customer.email ?? "—"}
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
