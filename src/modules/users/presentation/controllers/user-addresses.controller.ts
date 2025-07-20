import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BearerTokenGuard } from '../guards/bearer-token.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AddUserAddressDto } from '../../application/dto/add-user-address.dto';
import { UpdateUserAddressDto } from '../../application/dto/update-user-address.dto';
import { AddUserAddressCommand } from '../../application/commands/add-user-address.command';
import { UpdateUserAddressCommand } from '../../application/commands/update-user-address.command';
import { DeleteUserAddressCommand } from '../../application/commands/delete-user-address.command';
import { SetDefaultAddressCommand } from '../../application/commands/set-default-address.command';
import { GetUserAddressesQuery } from '../../application/queries/get-user-addresses.query';
import { AddressType } from '../../domain/entities/user-address.entity';

@ApiTags('User Addresses')
@Controller({ path: 'users/addresses', version: '1' })
@UseGuards(BearerTokenGuard)
@ApiBearerAuth()
export class UserAddressesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({
    status: 200,
    description: 'User addresses retrieved successfully',
  })
  @ApiQuery({
    name: 'type',
    enum: AddressType,
    required: false,
    description: 'Filter addresses by type',
  })
  async getUserAddresses(
    @CurrentUser('id') userId: string,
    @Query('type') type?: AddressType,
  ) {
    const query = new GetUserAddressesQuery(userId, type);
    const addresses = await this.queryBus.execute(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'User addresses retrieved successfully',
      data: addresses.map((address) => ({
        id: address.id,
        address: {
          street: address.address.getStreet(),
          city: address.address.getCity(),
          state: address.address.getState(),
          postalCode: address.address.getPostalCode(),
          country: address.address.getCountry(),
        },
        type: address.type,
        label: address.label,
        isDefault: address.isDefault,
        location: address.location
          ? {
              latitude: address.location.latitude,
              longitude: address.location.longitude,
            }
          : null,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      })),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Add new address' })
  @ApiResponse({
    status: 201,
    description: 'Address added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @HttpCode(HttpStatus.CREATED)
  async addAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: AddUserAddressDto,
  ) {
    const command = new AddUserAddressCommand(
      userId,
      dto.address,
      dto.type,
      dto.label,
      dto.isDefault,
    );

    const address = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Address added successfully',
      data: {
        id: address.id,
        address: {
          street: address.address.getStreet(),
          city: address.address.getCity(),
          state: address.address.getState(),
          postalCode: address.address.getPostalCode(),
          country: address.address.getCountry(),
        },
        type: address.type,
        label: address.label,
        isDefault: address.isDefault,
        location: address.location
          ? {
              latitude: address.location.latitude,
              longitude: address.location.longitude,
            }
          : null,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    };
  }

  @Put(':addressId')
  @ApiOperation({ summary: 'Update address' })
  @ApiParam({
    name: 'addressId',
    description: 'Address ID to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async updateAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateUserAddressDto,
  ) {
    const command = new UpdateUserAddressCommand(
      userId,
      addressId,
      dto.address,
      dto.type,
      dto.label,
    );

    const address = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Address updated successfully',
      data: {
        id: address.id,
        address: {
          street: address.address.getStreet(),
          city: address.address.getCity(),
          state: address.address.getState(),
          postalCode: address.address.getPostalCode(),
          country: address.address.getCountry(),
        },
        type: address.type,
        label: address.label,
        isDefault: address.isDefault,
        location: address.location
          ? {
              latitude: address.location.latitude,
              longitude: address.location.longitude,
            }
          : null,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    };
  }

  @Put(':addressId/default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiParam({
    name: 'addressId',
    description: 'Address ID to set as default',
  })
  @ApiResponse({
    status: 200,
    description: 'Default address set successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async setDefaultAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    const command = new SetDefaultAddressCommand(userId, addressId);
    const address = await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Default address set successfully',
      data: {
        id: address.id,
        address: {
          street: address.address.getStreet(),
          city: address.address.getCity(),
          state: address.address.getState(),
          postalCode: address.address.getPostalCode(),
          country: address.address.getCountry(),
        },
        type: address.type,
        label: address.label,
        isDefault: address.isDefault,
        location: address.location
          ? {
              latitude: address.location.latitude,
              longitude: address.location.longitude,
            }
          : null,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    };
  }

  @Delete(':addressId')
  @ApiOperation({ summary: 'Delete address' })
  @ApiParam({
    name: 'addressId',
    description: 'Address ID to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Address deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    const command = new DeleteUserAddressCommand(userId, addressId);
    await this.commandBus.execute(command);

    return {
      statusCode: HttpStatus.OK,
      message: 'Address deleted successfully',
    };
  }
}
