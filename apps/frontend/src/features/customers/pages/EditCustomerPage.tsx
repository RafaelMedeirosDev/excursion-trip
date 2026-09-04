import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomer } from "@/features/customers/hooks/useCustomer";
import { useUpdateCustomer } from "@/features/customers/hooks/useUpdateCustomer";
import {
  updateCustomerSchema,
  type UpdateCustomerInput,
} from "@/features/customers/validations/customerSchema";

export function EditCustomerPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useCustomer(id);
  const updateCustomer = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerSchema),
  });

  // o passageiro só chega depois do primeiro render (useQuery), então o form é
  // preenchido aqui em vez de por defaultValues
  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email ?? "",
        phone: customer.phone,
        cpf: customer.cpf,
      });
    }
  }, [customer, reset]);

  async function onSubmit(data: UpdateCustomerInput) {
    await updateCustomer.mutateAsync({
      id,
      // null (e não undefined) é o que faz o backend limpar o e-mail
      payload: { ...data, email: data.email ? data.email : null },
    });
    navigate(`/passengers/${id}`);
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
        icon={UserRound}
        title="Passageiro não encontrado"
        description="Esse passageiro não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/passengers">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!customer) {
    return null;
  }

  const isDuplicateCpf =
    isAxiosError(updateCustomer.error) &&
    updateCustomer.error.response?.status === 409;

  return (
    <div>
      <PageTitle
        title="Editar Passageiro"
        description="Atualize os dados de contato do passageiro."
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
              <p className="text-xs text-muted-foreground">
                Deixe em branco para remover o e-mail.
              </p>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
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

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" {...register("cpf")} />
              {errors.cpf && (
                <p className="text-sm text-destructive">{errors.cpf.message}</p>
              )}
            </div>

            {updateCustomer.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {isDuplicateCpf
                  ? "Já existe um passageiro com esse CPF."
                  : "Não foi possível salvar o passageiro. Confira os dados e tente de novo."}
              </p>
            )}

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button asChild variant="outline" type="button">
                <Link to={`/passengers/${id}`}>Cancelar</Link>
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
