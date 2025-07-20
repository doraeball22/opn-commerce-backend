import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserProfileQuery } from '../queries/get-user-profile.query';
import { UserProfileDto } from '../dto/user-profile.dto';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(userId: string): Promise<UserProfileDto> {
    const query = new GetUserProfileQuery(userId);
    return this.queryBus.execute(query);
  }
}
