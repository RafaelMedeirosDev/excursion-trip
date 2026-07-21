import { Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Shell mínimo por enquanto — Sidebar/Header completos entram na próxima fase
 * (ver plano de arquitetura do frontend).
 */
export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <span className="font-semibold">Gestão de Excursões</span>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {user && <span>{user.role}</span>}
          <button
            type="button"
            onClick={() => logout()}
            className="text-foreground hover:underline"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
