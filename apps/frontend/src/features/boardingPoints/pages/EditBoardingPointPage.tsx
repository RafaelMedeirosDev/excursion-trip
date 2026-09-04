import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/layout/PageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoardingPoint } from "@/features/boardingPoints/hooks/useBoardingPoint";
import { useUpdateBoardingPoint } from "@/features/boardingPoints/hooks/useUpdateBoardingPoint";
import {
  updateBoardingPointSchema,
  type UpdateBoardingPointInput,
} from "@/features/boardingPoints/validations/boardingPointSchema";
import { useVehicleBooking } from "@/features/vehicleBookings/hooks/useVehicleBooking";

export function EditBoardingPointPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: boardingPoint, isLoading, error } = useBoardingPoint(id);
  const { data: vehicleBooking } = useVehicleBooking(
    boardingPoint?.vehicleBookingId ?? "",
  );
  const updateBoardingPoint = useUpdateBoardingPoint();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBoardingPointInput>({
    resolver: zodResolver(updateBoardingPointSchema),
  });

  // o ponto só chega depois do primeiro render (useQuery), então o form é
  // preenchido aqui em vez de por defaultValues
  useEffect(() => {
    if (boardingPoint) {
      reset({
        address: boardingPoint.address,
        time: boardingPoint.time ?? "",
      });
    }
  }, [boardingPoint, reset]);

  async function onSubmit(data: UpdateBoardingPointInput) {
    await updateBoardingPoint.mutateAsync({
      id,
      // null (e não undefined) é o que faz o backend limpar o horário
      payload: { ...data, time: data.time ? data.time : null },
    });
    navigate(`/boarding-points/${id}`);
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
        icon={MapPin}
        title="Ponto de embarque não encontrado"
        description="Esse ponto de embarque não existe ou foi removido."
        action={
          <Button asChild variant="outline">
            <Link to="/boarding-points">Voltar pra lista</Link>
          </Button>
        }
      />
    );
  }

  if (!boardingPoint) {
    return null;
  }

  return (
    <div>
      <PageTitle
        title="Editar Ponto de Embarque"
        description="Atualize o endereço e o horário de embarque."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {/* o veículo é fixo: trocá-lo deixaria reservas apontando pra
                embarque de outro ônibus, então aqui é só contexto */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Veículo</Label>
              <p className="text-sm text-muted-foreground">
                {vehicleBooking
                  ? `${vehicleBooking.vehicleType}${
                      vehicleBooking.plate ? ` — ${vehicleBooking.plate}` : ""
                    }`
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                O veículo não pode ser alterado. Se estiver errado, cadastre um
                ponto novo.
              </p>
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

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" placeholder="05:30" {...register("time")} />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para remover o horário.
              </p>
              {errors.time && (
                <p className="text-sm text-destructive">
                  {errors.time.message}
                </p>
              )}
            </div>

            {updateBoardingPoint.isError && (
              <p className="text-sm text-destructive sm:col-span-2">
                Não foi possível salvar o ponto de embarque. Confira os dados e
                tente de novo.
              </p>
            )}

            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button asChild variant="outline" type="button">
                <Link to={`/boarding-points/${id}`}>Cancelar</Link>
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
