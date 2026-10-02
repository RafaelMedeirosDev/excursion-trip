import { zodResolver } from "@hookform/resolvers/zod";
import { EXPENSE_CATEGORY_LABELS } from "@excursion-trip/shared";
import { isAxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { useExcursion } from "@/features/excursions/hooks/useExcursion";
import { useCreateExpense } from "@/features/expenses/hooks/useCreateExpense";
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from "@/features/expenses/validations/expenseSchema";
import { useVehicleBookings } from "@/features/vehicleBookings/hooks/useVehicleBookings";

const CATEGORY_OPTIONS = Object.entries(EXPENSE_CATEGORY_LABELS) as [
  keyof typeof EXPENSE_CATEGORY_LABELS,
  string,
][];

const NO_VEHICLE_BOOKING = "none";

function vehicleLabel(vehicleType: string, plate: string | null) {
  return plate ? `${vehicleType} — ${plate}` : vehicleType;
}

export function CreateExpensePage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: excursion } = useExcursion(id);
  const { data: vehicleBookings } = useVehicleBookings();
  const createExpense = useCreateExpense();

  // só os veículos dessa excursão podem receber a despesa
  const excursionVehicleBookings = vehicleBookings?.filter(
    (vehicleBooking) => vehicleBooking.excursionId === id,
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
  });

  async function onSubmit(data: CreateExpenseInput) {
    await createExpense.mutateAsync({
      excursionId: id,
      category: data.category,
      description: data.description,
      // valor é digitado em reais e gravado em centavos
      value: Math.round(Number(data.value) * 100),
      vehicleBookingId:
        data.vehicleBookingId && data.vehicleBookingId !== NO_VEHICLE_BOOKING
          ? data.vehicleBookingId
          : undefined,
    });
    navigate(`/excursions/${id}`);
  }

  const isNotFound =
    isAxiosError(createExpense.error) &&
    createExpense.error.response?.status === 404;

  return (
    <div>
      <PageTitle
        title="Nova Despesa"
        description={
          excursion
            ? `Lançamento para ${excursion.name}.`
            : "Lançamento de despesa da excursão."
        }
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                {...register("value")}
              />
              {errors.value && (
                <p className="text-sm text-destructive">
                  {errors.value.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="vehicleBookingId">Veículo (opcional)</Label>
              <Controller
                name="vehicleBookingId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? NO_VEHICLE_BOOKING}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="vehicleBookingId">
                      <SelectValue placeholder="Nenhum veículo específico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_VEHICLE_BOOKING}>
                        Nenhum veículo específico
                      </SelectItem>
                      {excursionVehicleBookings?.map((vehicleBooking) => (
                        <SelectItem
                          key={vehicleBooking.id}
                          value={vehicleBooking.id}
                        >
                          {vehicleLabel(
                            vehicleBooking.vehicleType,
                            vehicleBooking.plate,
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                Use quando a despesa for de um ônibus específico, como
                combustível ou pedágio.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={3} {...register("description")} />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {createExpense.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                {isNotFound
                  ? "Excursão ou veículo não encontrado. Recarregue a página e tente de novo."
                  : "Não foi possível lançar a despesa. Confira os dados e tente de novo."}
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
