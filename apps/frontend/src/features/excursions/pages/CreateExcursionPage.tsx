import { zodResolver } from "@hookform/resolvers/zod";
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
import { useEvents } from "@/features/events/hooks/useEvents";
import { useCreateExcursion } from "@/features/excursions/hooks/useCreateExcursion";
import {
  createExcursionSchema,
  type CreateExcursionInput,
} from "@/features/excursions/validations/excursionSchema";

export function CreateExcursionPage() {
  const navigate = useNavigate();
  const createExcursion = useCreateExcursion();
  const { data: events } = useEvents();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateExcursionInput>({
    resolver: zodResolver(createExcursionSchema),
  });

  async function onSubmit(data: CreateExcursionInput) {
    const excursion = await createExcursion.mutateAsync(data);
    navigate(`/excursions/${excursion.id}`, { replace: true });
  }

  return (
    <div>
      <PageTitle
        title="Nova Excursão"
        description="Excursões precisam de um evento já cadastrado."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="eventId">Evento</Label>
              <Controller
                name="eventId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="eventId">
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.eventId && (
                <p className="text-sm text-destructive">
                  {errors.eventId.message}
                </p>
              )}
            </div>

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

            {createExcursion.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                Não foi possível criar a excursão. Confira os dados e tente de
                novo.
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
