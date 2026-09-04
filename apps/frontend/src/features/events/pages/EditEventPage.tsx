import { zodResolver } from "@hookform/resolvers/zod";
import { UF_LABELS } from "@excursion-trip/shared";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { CalendarDays } from "lucide-react";
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
import { useEvent } from "@/features/events/hooks/useEvent";
import { useUpdateEvent } from "@/features/events/hooks/useUpdateEvent";
import {
  updateEventSchema,
  type UpdateEventInput,
} from "@/features/events/validations/eventSchema";

const UF_OPTIONS = Object.entries(UF_LABELS) as [
  keyof typeof UF_LABELS,
  string,
][];

export function EditEventPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id);
  const updateEvent = useUpdateEvent();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(updateEventSchema),
  });

  // o evento só chega depois do primeiro render (useQuery), então o form é
  // preenchido aqui em vez de por defaultValues
  useEffect(() => {
    if (event) {
      reset({
        name: event.name,
        address: event.address,
        city: event.city,
        state: event.state,
        // a API devolve ISO completo, mas <Input type="date"> só aceita
        // YYYY-MM-DD — sem o corte, os campos abrem vazios
        startDate: event.startDate.slice(0, 10),
        endDate: event.endDate.slice(0, 10),
        startTime: event.startTime,
        endTime: event.endTime,
      });
    }
  }, [event, reset]);

  async function onSubmit(data: UpdateEventInput) {
    await updateEvent.mutateAsync({ id, payload: data });
    navigate(`/events/${id}`);
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
        icon={CalendarDays}
        title="Evento não encontrado"
        description="Esse evento não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/events">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div>
      <PageTitle
        title="Editar Evento"
        description="Atualize os dados do evento."
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

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" {...register("address")} />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register("city")} />
              {errors.city && (
                <p className="text-sm text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {UF_OPTIONS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state && (
                <p className="text-sm text-destructive">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de início</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-sm text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de término</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-sm text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de início</Label>
              <Input id="startTime" type="time" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-sm text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de término</Label>
              <Input id="endTime" type="time" {...register("endTime")} />
              {errors.endTime && (
                <p className="text-sm text-destructive">
                  {errors.endTime.message}
                </p>
              )}
            </div>

            {updateEvent.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                Não foi possível salvar o evento. Confira os dados e tente de
                novo.
              </p>
            )}

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button asChild variant="outline" type="button">
                <Link to={`/events/${id}`}>Cancelar</Link>
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
