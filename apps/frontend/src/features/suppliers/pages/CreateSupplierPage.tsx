import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/layout/PageTitle";
import { useCreateSupplier } from "@/features/suppliers/hooks/useCreateSupplier";
import {
  createSupplierSchema,
  type CreateSupplierInput,
} from "@/features/suppliers/validations/supplierSchema";

export function CreateSupplierPage() {
  const navigate = useNavigate();
  const createSupplier = useCreateSupplier();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSupplierInput>({
    resolver: zodResolver(createSupplierSchema),
  });

  async function onSubmit(data: CreateSupplierInput) {
    const supplier = await createSupplier.mutateAsync(data);
    navigate(`/suppliers/${supplier.id}`, { replace: true });
  }

  const isDuplicateCnpj =
    isAxiosError(createSupplier.error) &&
    createSupplier.error.response?.status === 409;

  return (
    <div>
      <PageTitle
        title="Novo Fornecedor"
        description="Fornecedores servem de base pros veículos das excursões."
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
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" {...register("cnpj")} />
              {errors.cnpj && (
                <p className="text-sm text-destructive">
                  {errors.cnpj.message}
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
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" {...register("address")} />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            {createSupplier.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {isDuplicateCnpj
                  ? "Já existe um fornecedor com esse CNPJ nessa organização."
                  : "Não foi possível criar o fornecedor. Confira os dados e tente de novo."}
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
