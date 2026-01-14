import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminJwtAuthGuard } from '../auth/guards';
import { CurrentAdmin } from '../../../common/decorators';
import { Admin } from '../../../entities';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Admin Users')
@ApiBearerAuth('admin-jwt')
@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  async findAll(@CurrentAdmin() admin: Admin) {
    return this.usersService.findAll();
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
