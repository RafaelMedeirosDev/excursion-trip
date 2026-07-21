import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ROLE_LABELS } from "@/features/users/constants";
import { useCreateUser } from "@/features/users/hooks/useCreateUser";
import {
  createUserSchema,
  type CreateUserInput,
} from "@/features/users/validations/userSchema";

export function CreateUserPage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  async function onSubmit(data: CreateUserInput) {
    const user = await createUser.mutateAsync(data);
    navigate(`/users/${user.id}`, { replace: true });
  }

  const isDuplicate =
    isAxiosError(createUser.error) && createUser.error.response?.status === 409;

  return (
    <div>
      <PageTitle
        title="Novo Usuário"
        description="Cadastre um usuário com acesso à sua organização."
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
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} />
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
                <p className="text-sm text-destructive">
                  {errors.cpf.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role">Perfil</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>

            {createUser.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {isDuplicate
                  ? "Já existe um usuário com esse e-mail ou CPF."
                  : "Não foi possível criar o usuário. Confira os dados e tente de novo."}
              </p>
            )}

            <div className="flex justify-end gap-2 sm:col-span-2">
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
