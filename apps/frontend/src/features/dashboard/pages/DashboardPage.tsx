import { PageTitle } from "@/components/layout/PageTitle";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageTitle
        title="Dashboard"
        description="Visão geral da sua organização."
      />
      <p className="text-sm text-muted-foreground">
        Login funcionando — organização{" "}
        <span className="font-medium">{user?.organizationId}</span>, role{" "}
        <span className="font-medium">{user?.role}</span>.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Cards de resumo por status entram na próxima fase.
      </p>
    </div>
  );
}
