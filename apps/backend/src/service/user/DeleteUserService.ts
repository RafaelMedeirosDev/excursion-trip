import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domain/UserRepository';
import { UserCannotDeleteThemselves } from 'src/shared/erros/cases/UserCannotDeleteThemselves';
import { UserNotFound } from 'src/shared/erros/cases/UserNotFound';

interface Request {
  organizationId: string;
  currentUserId: string;
  id: string;
}

@Injectable()
export class DeleteUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ organizationId, currentUserId, id }: Request): Promise<void> {
    const user = await this.userRepository.findById({ id });

    if (!user || user.organizationId !== organizationId) {
      throw new UserNotFound();
    }

    if (id === currentUserId) {
      throw new UserCannotDeleteThemselves();
    }

    await this.userRepository.softDelete({ id });
  }
}
