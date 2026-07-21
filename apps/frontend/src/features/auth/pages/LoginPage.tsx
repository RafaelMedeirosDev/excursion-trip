import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Excursões</CardTitle>
        <CardDescription>Entre com sua conta para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
