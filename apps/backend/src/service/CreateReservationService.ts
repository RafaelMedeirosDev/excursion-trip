import { Injectable } from '@nestjs/common';
import { Reservation } from '@prisma/client';
import { BoardingPointRepository } from 'src/domain/BoardingPointRepository';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { BoardingPointNotFound } from 'src/shared/erros/cases/BoardingPointNotFound';
import { CustomerNotFound } from 'src/shared/erros/cases/CustomerNotFound';
import { ReservationAlreadyExists } from 'src/shared/erros/cases/ReservationAlreadyExists';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';

interface Request {
  organizationId: string;
  userId: string;
  customerId: string;
  vehicleBookingId: string;
  boardingPointId?: string;
  agreedValue: number;
}

@Injectable()
export class CreateReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly vehicleBookingRepository: VehicleBookingRepository,
    private readonly boardingPointRepository: BoardingPointRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    customerId,
    vehicleBookingId,
    boardingPointId,
    agreedValue,
  }: Request): Promise<Reservation> {
    const customer = await this.customerRepository.findById({
      id: customerId,
    });

    if (!customer || customer.organizationId !== organizationId) {
      throw new CustomerNotFound();
    }

    const vehicleBooking = await this.vehicleBookingRepository.findById({
      id: vehicleBookingId,
    });

    if (!vehicleBooking || vehicleBooking.organizationId !== organizationId) {
      throw new VehicleBookingNotFound();
    }

    if (boardingPointId) {
      const boardingPoint = await this.boardingPointRepository.findById({
        id: boardingPointId,
      });

      if (
        !boardingPoint ||
        boardingPoint.organizationId !== organizationId ||
        boardingPoint.vehicleBookingId !== vehicleBookingId
      ) {
        throw new BoardingPointNotFound();
      }
    }

    const existingReservation =
      await this.reservationRepository.findByVehicleBookingAndCustomer({
        vehicleBookingId,
        customerId,
      });

    if (existingReservation) {
      throw new ReservationAlreadyExists();
    }

    return await this.reservationRepository.create({
      organizationId,
      userId,
      customerId,
      vehicleBookingId,
      boardingPointId,
      agreedValue,
    });
  }
}
