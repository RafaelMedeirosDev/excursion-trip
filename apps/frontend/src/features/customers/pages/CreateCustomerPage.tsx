import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/layout/PageTitle";
import { useCreateCustomer } from "@/features/customers/hooks/useCreateCustomer";
import {
  createCustomerSchema,
  type CreateCustomerInput,
} from "@/features/customers/validations/customerSchema";

export function CreateCustomerPage() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
  });

  async function onSubmit(data: CreateCustomerInput) {
    const customer = await createCustomer.mutateAsync({
      ...data,
      email: data.email ? data.email : undefined,
    });
    navigate(`/passengers/${customer.id}`, { replace: true });
  }

  const isDuplicateCpf =
    isAxiosError(createCustomer.error) &&
    createCustomer.error.response?.status === 409;

  return (
    <div>
      <PageTitle
        title="Novo Passageiro"
        description="Cadastre um passageiro pra registrar reservas depois."
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
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {createCustomer.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {isDuplicateCpf
                  ? "Já existe um passageiro com esse CPF nessa organização."
                  : "Não foi possível criar o passageiro. Confira os dados e tente de novo."}
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
