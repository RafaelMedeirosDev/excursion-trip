import { Plus, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { ROLE_LABELS } from "@excursion-trip/shared";
import { useUsers } from "@/features/users/hooks/useUsers";

export function UsersPage() {
  const { data: users, isLoading } = useUsers();

  return (
    <div>
      <PageTitle
        title="Usuários"
        description="Usuários com acesso à sua organização."
        action={
          <Button asChild>
            <Link to="/users/new">
              <Plus className="mr-2 size-4" />
              Novo Usuário
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

      {!isLoading && users && users.length === 0 && (
        <EmptyState
          icon={UserCog}
          title="Nenhum usuário cadastrado"
          description="Crie o primeiro usuário da sua organização."
          action={
            <Button asChild>
              <Link to="/users/new">
                <Plus className="mr-2 size-4" />
                Novo Usuário
              </Link>
            </Button>
          }
        />
      )}

      {!isLoading && users && users.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Telefone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link
                    to={`/users/${user.id}`}
                    className="font-medium hover:underline"
                  >
                    {user.name}
                  </Link>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                <TableCell>{user.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
