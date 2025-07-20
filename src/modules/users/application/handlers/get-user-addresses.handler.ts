import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserAddressesQuery } from '../queries/get-user-addresses.query';
import { UserAddressRepository } from '../../domain/repositories/user-address.repository';
import { UserAddress } from '../../domain/entities/user-address.entity';

@QueryHandler(GetUserAddressesQuery)
export class GetUserAddressesHandler
  implements IQueryHandler<GetUserAddressesQuery>
{
  constructor(
    @Inject('UserAddressRepository')
    private readonly userAddressRepository: UserAddressRepository,
  ) {}

  async execute(query: GetUserAddressesQuery): Promise<UserAddress[]> {
    const { userId, type } = query;

    if (type) {
      return await this.userAddressRepository.findByUserIdAndType(userId, type);
    }

    return await this.userAddressRepository.findByUserId(userId);
  }
}
