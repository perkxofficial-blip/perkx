import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  Put,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminJwtAuthGuard } from '../auth/guards';
import { CurrentAdmin } from '../../../common/decorators';
import { Admin, UserStatus, UserGender } from '../../../entities';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ListUsersQueryDto, UpdateUserStatusDto, UpdateUserDto } from './dto';

@ApiTags('Admin Users')
@ApiBearerAuth('admin-jwt')
@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with filters and pagination' })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Search by email, referral_code, or referral_code of referral user',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date for date range filter',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date for date range filter',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (default: 50)',
    type: Number,
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users retrieved successfully with pagination',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              email: { type: 'string' },
              referral_code: { type: 'string' },
              birthday: { type: 'string', format: 'date', nullable: true },
              gender: {
                type: 'string',
                enum: ['Male', 'Female'],
                nullable: true,
              },
              country: { type: 'string', nullable: true },
              created_at: { type: 'string', format: 'date-time' },
              referral_by: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'number' },
                  email: { type: 'string' },
                  referral_code: { type: 'string' },
                },
              },
              status: {
                type: 'string',
                enum: ['INACTIVE', 'ACTIVE', 'DEACTIVATE'],
              },
              email_verified_at: {
                type: 'string',
                format: 'date-time',
                nullable: true,
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  async findAll(
    @CurrentAdmin() admin: Admin,
    @Query() queryDto: ListUsersQueryDto,
  ) {
    return this.usersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user detail by ID with referrer, referrals, and exchanges',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'User detail retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        phone: { type: 'string', nullable: true },
        birthday: { type: 'string', format: 'date', nullable: true },
        gender: { type: 'string', enum: ['Male', 'Female'], nullable: true },
        country: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['INACTIVE', 'ACTIVE', 'DEACTIVATE'] },
        referral_code: { type: 'string' },
        email_verified_at: {
          type: 'string',
          format: 'date-time',
          nullable: true,
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        referrer: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'number' },
            name: { type: 'string', nullable: true },
            email: { type: 'string' },
          },
        },
        referrals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              email: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        exchanges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              uid: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update user status (ACTIVE or DEACTIVATE only)' })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        status: { type: 'string', enum: ['ACTIVE', 'DEACTIVATE'] },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid status value',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    const user = await this.usersService.updateStatus(
      +id,
      updateStatusDto.status,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Update user information (email and referral_user_id cannot be updated)',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        first_name: { type: 'string', nullable: true },
        last_name: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        birthday: { type: 'string', format: 'date', nullable: true },
        gender: { type: 'string', enum: ['Male', 'Female'], nullable: true },
        country: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DEACTIVATE'] },
        referral_code: { type: 'string' },
        email_verified_at: {
          type: 'string',
          format: 'date-time',
          nullable: true,
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(+id, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
