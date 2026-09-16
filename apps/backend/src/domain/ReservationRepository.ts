import {
  BoardingPoint,
  Customer,
  Reservation,
  ReservationStatus,
  User,
  VehicleBooking,
} from '@prisma/client';

export interface Create {
  organizationId: string;
  userId: string;
  customerId: string;
  vehicleBookingId: string;
  boardingPointId?: string;
  agreedValue: number;
}

export interface FindActiveByEventAndCustomer {
  eventId: string;
  customerId: string;
}

export interface FindById {
  id: string;
}

export interface CountActiveByVehicleBookingId {
  vehicleBookingId: string;
}

export interface CountUpcomingByCustomerId {
  customerId: string;
}

export interface FindAll {
  organizationId: string;
  userId?: string;
  status?: ReservationStatus;
  vehicleBookingId?: string;
}

export interface FindAllPaginated {
  organizationId: string;
  userId?: string;
  status?: ReservationStatus;
  eventName?: string;
  page: number;
  limit: number;
}

export type Reservations = Omit<Reservation, 'deletedAt'> & {
  customer: Omit<Customer, 'deletedAt'>;
  vehicleBooking: Omit<VehicleBooking, 'deletedAt'>;
  boardingPoint: Omit<BoardingPoint, 'deletedAt'> | null;
  user: Omit<User, 'password' | 'deletedAt'>;
};

export interface PaginatedReservations {
  data: Reservations[];
  total: number;
  page: number;
  limit: number;
}

// Troca de status serializada por veiculo, usada por toda transicao que pode
// FAZER a reserva ocupar vaga. `fromStatuses` fecha a janela de last-write-wins
// (uma reserva cancelada em paralelo nunca e ressuscitada) e `occupyingStatuses`
// diz quais status contam como ocupacao — a semantica vem de quem chama, nao do
// repositorio.
export interface UpdateStatusWithinCapacity {
  id: string;
  fromStatuses: ReservationStatus[];
  toStatus: ReservationStatus;
  occupyingStatuses: ReservationStatus[];
}

// Resultado discriminado em vez de excecao: a politica de erro difere entre os
// chamadores (as rotas de status lancam 400, a sincronizacao do pagamento
// ignora em silencio), entao quem decide e o Service.
export type UpdateStatusWithinCapacityResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; reason: 'NOT_FOUND' | 'STATUS_CHANGED' | 'CAPACITY_EXCEEDED' };

export interface UpdateStatus {
  id: string;
  status: ReservationStatus;
  canceledAt?: Date;
  cancelReason?: string;
}

export abstract class ReservationRepository {
  abstract create({
    organizationId,
    userId,
    customerId,
    vehicleBookingId,
    boardingPointId,
    agreedValue,
  }: Create): Promise<Reservation>;

  abstract findActiveByEventAndCustomer({
    eventId,
    customerId,
  }: FindActiveByEventAndCustomer): Promise<Reservation | null>;

  abstract findById({ id }: FindById): Promise<Reservation | null>;

  abstract countActiveByVehicleBookingId({
    vehicleBookingId,
  }: CountActiveByVehicleBookingId): Promise<number>;

  abstract countUpcomingByCustomerId({
    customerId,
  }: CountUpcomingByCustomerId): Promise<number>;

  abstract findAll({
    organizationId,
    userId,
    status,
    vehicleBookingId,
  }: FindAll): Promise<Reservations[]>;

  abstract findAllPaginated({
    organizationId,
    userId,
    status,
    eventName,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedReservations>;

  abstract updateStatusWithinCapacity({
    id,
    fromStatuses,
    toStatus,
    occupyingStatuses,
  }: UpdateStatusWithinCapacity): Promise<UpdateStatusWithinCapacityResult>;

  abstract updateStatus({
    id,
    status,
    canceledAt,
    cancelReason,
  }: UpdateStatus): Promise<Reservation>;
}
