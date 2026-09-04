import { isAxiosError } from "axios";
import { Building2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupplier } from "@/features/suppliers/hooks/useSupplier";

export function SupplierDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: supplier, isLoading, error } = useSupplier(id ?? "");

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
        icon={Building2}
        title="Fornecedor não encontrado"
        description="Esse fornecedor não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/suppliers">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!supplier) {
    return null;
  }

  return (
    <div>
      <PageTitle
        title={supplier.name}
        action={
          <Button asChild>
            <Link to={`/suppliers/${supplier.id}/edit`}>Editar</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
          <Field label="CNPJ" value={supplier.cnpj} />
          <Field label="Telefone" value={supplier.phone} />
          <Field label="Endereço" value={supplier.address ?? "—"} />
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
