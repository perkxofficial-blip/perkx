import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminJwtAuthGuard } from '../auth/guards';
import { CurrentAdmin } from '../../../common/decorators';
import { Admin, UserStatus } from '../../../entities';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@ApiTags('Admin Users')
@ApiBearerAuth('admin-jwt')
@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with filters and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by email, referral_code, or referral_code of referral user' })
  @ApiQuery({ name: 'start_date', required: false, description: 'Start date for date range filter' })
  @ApiQuery({ name: 'end_date', required: false, description: 'End date for date range filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: UserStatus, example: UserStatus.ACTIVE })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (default: 50)', type: Number, example: 50 })
  @ApiResponse({
    status: 200,
    description: 'List of all users retrieved successfully with pagination',
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
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
