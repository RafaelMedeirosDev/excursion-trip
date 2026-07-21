import { useAuth } from "@/features/auth/hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Login funcionando — organização{" "}
        <span className="font-medium">{user?.organizationId}</span>, role{" "}
        <span className="font-medium">{user?.role}</span>.
      </p>
      <p className="text-sm text-muted-foreground">
        Cards de resumo por status entram na próxima fase.
      </p>
    </div>
  );
}
