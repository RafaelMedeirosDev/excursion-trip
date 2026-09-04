import { Excursion, Supplier, User, VehicleBooking } from '@prisma/client';

export interface Create {
  organizationId: string;
  supplierId: string;
  excursionId: string;
  userId: string;
  vehicleType: string;
  plate?: string;
  capacity: number;
  value: number;
  startTime?: string;
  returnTime?: string;
  price: number;
}

export interface FindByExcursionAndPlate {
  excursionId: string;
  plate: string;
}

export interface CountUpcomingBySupplierId {
  supplierId: string;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
  userId?: string;
}

export interface FindAllPaginated {
  organizationId: string;
  userId?: string;
  query?: string;
  page: number;
  limit: number;
}

export type VehicleBookings = Omit<VehicleBooking, 'deletedAt'> & {
  excursion: Excursion;
  supplier: Omit<Supplier, 'deletedAt'>;
  user: Omit<User, 'password' | 'deletedAt'>;
};

export interface PaginatedVehicleBookings {
  data: VehicleBookings[];
  total: number;
  page: number;
  limit: number;
}

export abstract class VehicleBookingRepository {
  abstract create({
    organizationId,
    supplierId,
    excursionId,
    userId,
    vehicleType,
    plate,
    capacity,
    value,
    startTime,
    returnTime,
    price,
  }: Create): Promise<VehicleBooking>;

  abstract findByExcursionAndPlate({
    excursionId,
    plate,
  }: FindByExcursionAndPlate): Promise<VehicleBooking | null>;

  abstract countUpcomingBySupplierId({
    supplierId,
  }: CountUpcomingBySupplierId): Promise<number>;

  abstract findById({ id }: FindById): Promise<VehicleBooking | null>;

  abstract findAll({ organizationId, userId }: FindAll): Promise<VehicleBookings[]>;

  abstract findAllPaginated({
    organizationId,
    userId,
    query,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedVehicleBookings>;
}
