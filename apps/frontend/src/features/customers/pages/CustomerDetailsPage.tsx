import { isAxiosError } from "axios";
import { UserRoundX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCustomer } from "@/features/customers/hooks/useCustomer";

export function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const { data: customer, isLoading, error } = useCustomer(id ?? "");

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isAxiosError(error) && error.response?.status === 404) {
    return (
      <EmptyState
        icon={UserRoundX}
        title="Passageiro não encontrado"
        description="Esse passageiro não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/passengers">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div>
      <PageTitle
        title={customer.name}
        action={
          hasRole("ADM") ? (
            <Button asChild>
              <Link to={`/passengers/${customer.id}/edit`}>Editar</Link>
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
          <Field label="Telefone" value={customer.phone} />
          <Field label="CPF" value={customer.cpf} />
          <Field label="E-mail" value={customer.email ?? "—"} />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
