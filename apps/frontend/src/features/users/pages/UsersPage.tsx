import { Plus, UserCog } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
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
  const [query, setQuery] = useState("");
  const { data: users, isLoading } = useUsers();

  const filteredUsers = users?.filter((user) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.cpf.includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

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

      <div className="mb-4 w-full sm:w-80">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, CPF ou e-mail"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && filteredUsers && filteredUsers.length === 0 && (
        <EmptyState
          icon={UserCog}
          title="Nenhum usuário cadastrado"
          description={
            query === ""
              ? "Crie o primeiro usuário da sua organização."
              : "Nenhum usuário encontrado com esse filtro."
          }
          action={
            query === "" ? (
              <Button asChild>
                <Link to="/users/new">
                  <Plus className="mr-2 size-4" />
                  Novo Usuário
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {!isLoading && filteredUsers && filteredUsers.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
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
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredUsers.map((user) => (
              <Link key={user.id} to={`/users/${user.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="space-y-3 pt-6">
                    <span className="font-medium">{user.name}</span>

                    <div className="grid grid-cols-2 gap-3">
                      <CardField label="E-mail" value={user.email} />
                      <CardField label="CPF" value={user.cpf} />
                      <CardField
                        label="Perfil"
                        value={ROLE_LABELS[user.role]}
                      />
                      <CardField label="Telefone" value={user.phone} />
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
