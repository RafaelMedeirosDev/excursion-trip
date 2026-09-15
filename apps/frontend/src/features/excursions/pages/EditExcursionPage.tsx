import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { Route } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/features/events/hooks/useEvent";
import { useExcursion } from "@/features/excursions/hooks/useExcursion";
import { useUpdateExcursion } from "@/features/excursions/hooks/useUpdateExcursion";
import {
  updateExcursionSchema,
  type UpdateExcursionInput,
} from "@/features/excursions/validations/excursionSchema";

export function EditExcursionPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: excursion, isLoading, error } = useExcursion(id);
  const { data: event } = useEvent(excursion?.eventId ?? "");
  const updateExcursion = useUpdateExcursion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateExcursionInput>({
    resolver: zodResolver(updateExcursionSchema),
  });

  // a excursão só chega depois do primeiro render (useQuery), então o form é
  // preenchido aqui em vez de por defaultValues
  useEffect(() => {
    if (excursion) {
      reset({
        name: excursion.name,
        // a API devolve ISO completo, mas <Input type="date"> só aceita
        // YYYY-MM-DD — sem o corte, os campos abrem vazios
        departureDate: excursion.departureDate.slice(0, 10),
        returnDate: excursion.returnDate.slice(0, 10),
      });
    }
  }, [excursion, reset]);

  async function onSubmit(data: UpdateExcursionInput) {
    await updateExcursion.mutateAsync({ id, payload: data });
    navigate(`/excursions/${id}`);
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
        icon={Route}
        title="Excursão não encontrada"
        description="Essa excursão não existe ou foi removida."
        action={
          <Button asChild variant="outline">
            <Link to="/excursions">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!excursion) {
    return null;
  }

  const errorCode = isAxiosError(updateExcursion.error)
    ? (updateExcursion.error.response?.data as { error?: string } | undefined)
        ?.error
    : undefined;

  return (
    <div>
      <PageTitle
        title="Editar Excursão"
        description="Atualize os dados da excursão."
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
              <Label htmlFor="departureDate">Data de saída</Label>
              <Input
                id="departureDate"
                type="date"
                {...register("departureDate")}
              />
              {errors.departureDate && (
                <p className="text-sm text-destructive">
                  {errors.departureDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnDate">Data de volta</Label>
              <Input id="returnDate" type="date" {...register("returnDate")} />
              {errors.returnDate && (
                <p className="text-sm text-destructive">
                  {errors.returnDate.message}
                </p>
              )}
            </div>

            {/* o evento é contexto só-leitura: trocá-lo deixaria passageiros
                com duas reservas ativas no mesmo evento */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Evento</Label>
              <p className="text-sm">{event?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                O evento não pode ser alterado. Para vincular a excursão a outro
                evento, cadastre uma nova.
              </p>
            </div>

            {updateExcursion.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {errorCode === "excursion_invalid_date_range"
                  ? "A data de volta não pode ser antes da data de saída."
                  : errorCode === "excursion_not_editable"
                    ? "Essa excursão já foi concluída ou cancelada e não pode mais ser editada."
                    : "Não foi possível salvar a excursão. Confira os dados e tente de novo."}
              </p>
            )}

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button asChild variant="outline" type="button">
                <Link to={`/excursions/${id}`}>Cancelar</Link>
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
