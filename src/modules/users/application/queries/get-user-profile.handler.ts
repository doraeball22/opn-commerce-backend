import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserProfileQuery } from './get-user-profile.query';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserProfileDto } from '../dto/user-profile.dto';

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler
  implements IQueryHandler<GetUserProfileQuery>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUserProfileQuery): Promise<UserProfileDto> {
    const { userId } = query;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userProfile: UserProfileDto = {
      id: user.id,
      email: user.email.value,
      name: user.name,
      age: user.age,
      gender: user.gender.value,
      subscribedToNewsletter: user.subscribedToNewsletter,
    };

    return userProfile;
  }
}
