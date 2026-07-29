import { Injectable } from '@nestjs/common';
import { ExcursionStatus, VehicleBooking } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';
import { SupplierNotFound } from 'src/shared/erros/cases/SupplierNotFound';
import { UserNotFound } from 'src/shared/erros/cases/UserNotFound';
import { VehicleBookingAlreadyExists } from 'src/shared/erros/cases/VehicleBookingAlreadyExists';
import { VehicleBookingExcursionNotAvailable } from 'src/shared/erros/cases/VehicleBookingExcursionNotAvailable';

const ALLOWED_STATUSES: ExcursionStatus[] = [
  ExcursionStatus.PLANNING,
  ExcursionStatus.OPEN,
];

interface Request {
  organizationId: string;
  userId: string;
  supplierId: string;
  excursionId: string;
  vehicleType: string;
  plate?: string;
  capacity: number;
  value: number;
  startTime?: string;
  returnTime?: string;
  price: number;
}

@Injectable()
export class CreateVehicleBookingService {
  constructor(
    private readonly vehicleBookingRepository: VehicleBookingRepository,
    private readonly excursionRepository: ExcursionRepository,
    private readonly supplierRepository: SupplierRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    supplierId,
    excursionId,
    vehicleType,
    plate,
    capacity,
    value,
    startTime,
    returnTime,
    price,
  }: Request): Promise<VehicleBooking> {
    const excursion = await this.excursionRepository.findById({
      id: excursionId,
    });

    if (!excursion || excursion.organizationId !== organizationId) {
      throw new ExcursionNotFound();
    }

    if (!ALLOWED_STATUSES.includes(excursion.status)) {
      throw new VehicleBookingExcursionNotAvailable();
    }

    const supplier = await this.supplierRepository.findById({
      id: supplierId,
    });

    if (!supplier || supplier.organizationId !== organizationId) {
      throw new SupplierNotFound();
    }

    const user = await this.userRepository.findById({ id: userId });

    if (!user || user.organizationId !== organizationId) {
      throw new UserNotFound();
    }

    if (plate) {
      const alreadyExists =
        await this.vehicleBookingRepository.findByExcursionAndPlate({
          excursionId,
          plate,
        });

      if (alreadyExists) {
        throw new VehicleBookingAlreadyExists();
      }
    }

    return await this.vehicleBookingRepository.create({
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
    });
  }
}
