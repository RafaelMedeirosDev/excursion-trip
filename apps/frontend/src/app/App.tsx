import { useInitAuth } from "@/features/auth/hooks/useInitAuth";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";

function AppContent() {
  const { isInitializing } = useInitAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return <AppRouter />;
}

export function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
