import { isAxiosError } from "axios";
import { UserCog } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@excursion-trip/shared";
import { useUser } from "@/features/users/hooks/useUser";

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, error } = useUser(id ?? "");

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
        icon={UserCog}
        title="Usuário não encontrado"
        description="Esse usuário não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/users">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <PageTitle
        title={user.name}
        action={
          <Button asChild>
            <Link to={`/users/${user.id}/edit`}>Editar</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
          <Field label="E-mail" value={user.email} />
          <Field label="Perfil" value={ROLE_LABELS[user.role]} />
          <Field label="Telefone" value={user.phone} />
          <Field label="CPF" value={user.cpf} />
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
