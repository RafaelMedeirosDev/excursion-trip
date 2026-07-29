import { Injectable } from '@nestjs/common';
import { UserRepository, Users } from 'src/domain/UserRepository';

interface Request {
  organizationId: string;
}

@Injectable()
export class ListUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ organizationId }: Request): Promise<Users[]> {
    return await this.userRepository.findAll({ organizationId });
  }
}
