import { Plus, Route as RouteIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/components/layout/PageTitle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExcursionStatusBadge } from "@/features/excursions/components/ExcursionStatusBadge";
import { STATUS_LABELS } from "@/features/excursions/constants";
import { useExcursions } from "@/features/excursions/hooks/useExcursions";
import type { ExcursionStatus } from "@/features/excursions/types";
import { useState } from "react";

const STATUS_FILTERS: ExcursionStatus[] = [
  "PLANNING",
  "OPEN",
  "CLOSED",
  "DONE",
  "CANCELED",
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function ExcursionsPage() {
  const [statusFilter, setStatusFilter] = useState<ExcursionStatus | "ALL">(
    "ALL",
  );
  const [query, setQuery] = useState("");
  const { data: excursions, isLoading } = useExcursions(
    statusFilter === "ALL" ? undefined : statusFilter,
  );

  const filteredExcursions = excursions?.filter(
    (excursion) =>
      !query || excursion.event.name.toLowerCase().includes(query.toLowerCase()),
  );
  const hasActiveFilter = statusFilter !== "ALL" || query !== "";

  return (
    <div>
      <PageTitle
        title="Excursões"
        description="Excursões cadastradas na sua organização."
        action={
          <Button asChild>
            <Link to="/excursions/new">
              <Plus className="mr-2 size-4" />
              Nova Excursão
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="w-48">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as ExcursionStatus | "ALL")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              {STATUS_FILTERS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por evento"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && filteredExcursions && filteredExcursions.length === 0 && (
        <EmptyState
          icon={RouteIcon}
          title="Nenhuma excursão encontrada"
          description={
            hasActiveFilter
              ? "Nenhuma excursão encontrada com esse filtro."
              : "Crie a primeira excursão da sua organização."
          }
          action={
            hasActiveFilter ? undefined : (
              <Button asChild>
                <Link to="/excursions/new">
                  <Plus className="mr-2 size-4" />
                  Nova Excursão
                </Link>
              </Button>
            )
          }
        />
      )}

      {!isLoading && filteredExcursions && filteredExcursions.length > 0 && (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Volta</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExcursions.map((excursion) => (
                  <TableRow key={excursion.id}>
                    <TableCell>
                      <Link
                        to={`/excursions/${excursion.id}`}
                        className="font-medium hover:underline"
                      >
                        {excursion.name}
                      </Link>
                    </TableCell>
                    <TableCell>{excursion.event.name}</TableCell>
                    <TableCell>{formatDate(excursion.departureDate)}</TableCell>
                    <TableCell>{formatDate(excursion.returnDate)}</TableCell>
                    <TableCell>
                      <ExcursionStatusBadge status={excursion.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredExcursions.map((excursion) => (
              <Link key={excursion.id} to={`/excursions/${excursion.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{excursion.name}</span>
                      <ExcursionStatusBadge status={excursion.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <CardField label="Evento" value={excursion.event.name} />
                      <CardField
                        label="Saída"
                        value={formatDate(excursion.departureDate)}
                      />
                      <CardField
                        label="Volta"
                        value={formatDate(excursion.returnDate)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CardField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
