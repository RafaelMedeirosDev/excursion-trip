import { Injectable } from '@nestjs/common';
import { UserRepository, Users } from 'src/domain/UserRepository';
import { UserNotFound } from 'src/shared/erros/cases/UserNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class GetUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ organizationId, id }: Request): Promise<Users> {
    const user = await this.userRepository.findById({ id });

    if (!user || user.organizationId !== organizationId) {
      throw new UserNotFound();
    }

    return user;
  }
}
