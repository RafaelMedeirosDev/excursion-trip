import { Injectable } from '@nestjs/common';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { SupplierHasUpcomingVehicleBookings } from 'src/shared/erros/cases/SupplierHasUpcomingVehicleBookings';
import { SupplierNotFound } from 'src/shared/erros/cases/SupplierNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class DeleteSupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
    private readonly vehicleBookingRepository: VehicleBookingRepository,
  ) {}

  async execute({ organizationId, id }: Request): Promise<void> {
    const supplier = await this.supplierRepository.findById({ id });

    if (!supplier || supplier.organizationId !== organizationId) {
      throw new SupplierNotFound();
    }

    const upcomingVehicleBookings =
      await this.vehicleBookingRepository.countUpcomingBySupplierId({
        supplierId: id,
      });

    if (upcomingVehicleBookings > 0) {
      throw new SupplierHasUpcomingVehicleBookings();
    }

    await this.supplierRepository.softDelete({ id });
  }
}
