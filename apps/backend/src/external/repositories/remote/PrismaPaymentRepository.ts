import { Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';
import {
  Create,
  FindAll,
  FindById,
  FindByReservationId,
  PaymentRepository,
  Payments,
} from 'src/domain/PaymentRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    userId,
    reservationId,
    type,
    value,
    method,
  }: Create): Promise<Payment> {
    return this.repository.payment.create({
      data: { organizationId, userId, reservationId, type, value, method },
    });
  }

  findById({ id }: FindById): Promise<Payment | null> {
    return this.repository.payment.findFirst({ where: { id } });
  }

  findAll({ organizationId, userId }: FindAll): Promise<Payments[]> {
    return this.repository.payment.findMany({
      where: {
        organizationId,
        ...(userId ? { userId } : {}),
      },
      select: {
        id: true,
        organizationId: true,
        reservationId: true,
        userId: true,
        type: true,
        value: true,
        method: true,
        createdAt: true,
        reservation: {
          select: {
            id: true,
            organizationId: true,
            userId: true,
            customerId: true,
            vehicleBookingId: true,
            boardingPointId: true,
            status: true,
            agreedValue: true,
            canceledAt: true,
            cancelReason: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            organizationId: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  findByReservationId({
    reservationId,
  }: FindByReservationId): Promise<Payment[]> {
    return this.repository.payment.findMany({ where: { reservationId } });
  }
}
