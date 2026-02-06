import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserExchangesService } from './user-exchanges.service';
import { AdminJwtAuthGuard } from '../auth/guards';
import { CurrentAdmin } from '../../../common/decorators';
import { Admin } from '../../../entities';
import { ListUserExchangesQueryDto, UpdateUserExchangeDto } from './dto';

@ApiTags('Admin - User Exchanges')
@ApiBearerAuth('admin-jwt')
@Controller('admin/user_exchanges')
@UseGuards(AdminJwtAuthGuard)
export class UserExchangesController {
  constructor(private readonly userExchangesService: UserExchangesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of user exchanges',
    description: 'Returns paginated list of user exchanges with filters by exchange_id and status',
  })
  @ApiQuery({
    name: 'exchange_id',
    required: false,
    type: Number,
    description: 'Filter by exchange ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'PENDING', 'REJECTED'],
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 50)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'List of user exchanges retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              user_email: { type: 'string' },
              exchange_name: { type: 'string' },
              exchange_uid: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              status: { type: 'string', enum: ['ACTIVE', 'PENDING', 'REJECTED'] },
              updated_at: { type: 'string', format: 'date-time' },
              reason: { type: 'string', nullable: true },
              updated_by: { type: 'string', nullable: true },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total number of items' },
            page: { type: 'number', description: 'Current page number' },
            limit: { type: 'number', description: 'Number of items per page' },
            totalPages: { type: 'number', description: 'Total number of pages' },
          },
        },
      },
    },
  })
  async getUserExchanges(@Query() query: ListUserExchangesQueryDto) {
    return await this.userExchangesService.getUserExchanges(query);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user exchange status and reason',
    description: 'Update status (required) and reason (optional) for a user exchange',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User exchange ID',
  })
  @ApiBody({
    type: UpdateUserExchangeDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User exchange updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        status: { type: 'string', enum: ['ACTIVE', 'PENDING', 'REJECTED'] },
        reason: { type: 'string', nullable: true },
        updated_by: { type: 'string' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User exchange not found',
  })
  async updateUserExchange(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserExchangeDto,
    @CurrentAdmin() admin: Admin,
  ) {
    return await this.userExchangesService.updateUserExchange(
      id,
      updateDto,
      admin.username,
    );
  }
}
