import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { UserCog } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/layout/PageTitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@excursion-trip/shared";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUpdateUser } from "@/features/users/hooks/useUpdateUser";
import { useUser } from "@/features/users/hooks/useUser";
import {
  updateUserSchema,
  type UpdateUserInput,
} from "@/features/users/validations/userSchema";

export function EditUserPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: user, isLoading, error } = useUser(id);
  const updateUser = useUpdateUser();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  // O usuário só chega depois do primeiro render (useQuery), então o form é
  // preenchido aqui em vez de por defaultValues.
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        role: user.role,
        password: "",
      });
    }
  }, [user, reset]);

  // O backend bloqueia o ADM de alterar o próprio perfil (400); a UI já
  // desabilita o campo pra não oferecer uma ação que sempre falha.
  const isSelf = currentUser?.sub === id;

  async function onSubmit({ password, ...data }: UpdateUserInput) {
    await updateUser.mutateAsync({
      id,
      payload: { ...data, ...(password ? { password } : {}) },
    });
    navigate(`/users/${id}`);
  }

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

  const isDuplicate =
    isAxiosError(updateUser.error) && updateUser.error.response?.status === 409;
  const isOwnRoleChange =
    isAxiosError(updateUser.error) &&
    updateUser.error.response?.data?.error === "user_cannot_change_own_role";

  return (
    <div>
      <PageTitle
        title="Editar Usuário"
        description="Atualize os dados de acesso e o perfil do usuário."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" type="password" {...register("password")} />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para manter a senha atual.
              </p>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register("cpf")} />
              {errors.cpf && (
                <p className="text-sm text-destructive">{errors.cpf.message}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role">Perfil</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSelf}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADM">{ROLE_LABELS.ADM}</SelectItem>
                      <SelectItem value="EMPLOYEE">
                        {ROLE_LABELS.EMPLOYEE}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {isSelf && (
                <p className="text-xs text-muted-foreground">
                  Você não pode alterar o próprio perfil.
                </p>
              )}
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>

            {updateUser.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {isDuplicate
                  ? "Já existe um usuário com esse e-mail ou CPF."
                  : isOwnRoleChange
                    ? "Você não pode alterar o próprio perfil."
                    : "Não foi possível salvar o usuário. Confira os dados e tente de novo."}
              </p>
            )}

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button asChild variant="outline" type="button">
                <Link to={`/users/${id}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
