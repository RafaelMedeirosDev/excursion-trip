import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupplier } from "@/features/suppliers/hooks/useSupplier";
import { useUpdateSupplier } from "@/features/suppliers/hooks/useUpdateSupplier";
import {
  updateSupplierSchema,
  type UpdateSupplierInput,
} from "@/features/suppliers/validations/supplierSchema";

export function EditSupplierPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: supplier, isLoading, error } = useSupplier(id);
  const updateSupplier = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSupplierInput>({
    resolver: zodResolver(updateSupplierSchema),
  });

  // o fornecedor só chega depois do primeiro render (useQuery), então o form é
  // preenchido aqui em vez de por defaultValues
  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        cnpj: supplier.cnpj,
        address: supplier.address ?? "",
        phone: supplier.phone,
      });
    }
  }, [supplier, reset]);

  async function onSubmit(data: UpdateSupplierInput) {
    await updateSupplier.mutateAsync({
      id,
      // null (e não undefined) é o que faz o backend limpar o endereço
      payload: { ...data, address: data.address ? data.address : null },
    });
    navigate(`/suppliers/${id}`);
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
        icon={Building2}
        title="Fornecedor não encontrado"
        description="Esse fornecedor não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/suppliers">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!supplier) {
    return null;
  }

  const isDuplicateCnpj =
    isAxiosError(updateSupplier.error) &&
    updateSupplier.error.response?.status === 409;

  return (
    <div>
      <PageTitle
        title="Editar Fornecedor"
        description="Atualize os dados de contato do fornecedor."
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
              <p className="text-xs text-muted-foreground">
                Deixe em branco para remover o endereço.
              </p>
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            {updateSupplier.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {isDuplicateCnpj
                  ? "Já existe um fornecedor com esse CNPJ."
                  : "Não foi possível salvar o fornecedor. Confira os dados e tente de novo."}
              </p>
            )}

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button asChild variant="outline" type="button">
                <Link to={`/suppliers/${id}`}>Cancelar</Link>
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
