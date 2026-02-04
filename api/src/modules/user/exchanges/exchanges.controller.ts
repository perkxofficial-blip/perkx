import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ExchangesService } from './exchanges.service';
import { AddExchangeUidDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../../common/decorators';
import { User } from '../../../entities';

@ApiTags('User Exchanges')
@ApiBearerAuth('user-jwt')
@Controller('exchanges')
@UseGuards(JwtAuthGuard)
export class ExchangesController {
  constructor(private exchangesService: ExchangesService) {}

  @Post('uid')
  @ApiOperation({
    summary: 'Add exchange UID',
    description:
      'Add a UID from an exchange platform. The UID will be verified with the exchange API to ensure it is registered from the affiliate link.',
  })
  @ApiResponse({
    status: 201,
    description: 'Exchange UID added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        exchange_id: { type: 'number' },
        exchange_uid: { type: 'string' },
        exchange_name: { type: 'string' },
        exchange_code: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - UID verification failed or validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Exchange not found or not active',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Exchange already linked or UID already used',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async addExchangeUid(
    @CurrentUser() user: User,
    @Body() addExchangeUidDto: AddExchangeUidDto,
  ) {
    return this.exchangesService.addExchangeUid(
      user.id,
      addExchangeUidDto,
    );
  }

  @Delete('uid/:userExchangeId')
  @ApiOperation({
    summary: 'Delete exchange UID',
    description: 'Remove a linked exchange UID from your account',
  })
  @ApiParam({
    name: 'userExchangeId',
    description: 'User Exchange ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Exchange UID deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        exchange_name: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Exchange UID not found or does not belong to user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async deleteExchangeUid(
    @CurrentUser() user: User,
    @Param('userExchangeId', ParseIntPipe) userExchangeId: number,
  ) {
    return this.exchangesService.deleteExchangeUid(user.id, userExchangeId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all linked exchange UIDs',
    description: 'Get all exchange UIDs linked to your account',
  })
  @ApiResponse({
    status: 200,
    description: 'List of linked exchange UIDs',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'User exchange record ID' },
              exchange_id: { type: 'number' },
              exchange_uid: { type: 'string' },
              exchange_name: { type: 'string' },
              exchange_code: { type: 'string' },
              logo_path: { type: 'string', nullable: true },
              logo_url: { type: 'string', nullable: true },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getUserExchanges(@CurrentUser() user: User) {
    const exchanges = await this.exchangesService.getUserExchanges(user.id);
    return { data: exchanges };
  }
}
