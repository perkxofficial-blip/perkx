import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, UpdatePasswordDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../../common/decorators';
import { User, UserGender, UserStatus } from '../../../entities';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('User Profile')
@ApiBearerAuth('user-jwt')
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        first_name: { type: 'string', nullable: true },
        last_name: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        birthday: { type: 'string', format: 'date', nullable: true },
        gender: { type: 'string', enum: Object.values(UserGender), nullable: true },
        country: { type: 'string', nullable: true },
        status: { type: 'string', enum: Object.values(UserStatus) },
        referral_code: { type: 'string' },
        referral_user_id: { type: 'number', nullable: true },
        email_verified_at: { type: 'string', format: 'date-time', nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getProfile(@CurrentUser() user: User) {
    return this.profileService.getProfile(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        first_name: { type: 'string', nullable: true },
        last_name: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        birthday: { type: 'string', format: 'date', nullable: true },
        gender: { type: 'string', enum: Object.values(UserGender), nullable: true },
        country: { type: 'string', nullable: true },
        status: { type: 'string', enum: Object.values(UserStatus) },
        referral_code: { type: 'string' },
        referral_user_id: { type: 'number', nullable: true },
        email_verified_at: { type: 'string', format: 'date-time', nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.id, updateProfileDto);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password updated successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - current password incorrect or validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async updatePassword(
    @CurrentUser() user: User,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.profileService.updatePassword(user.id, updatePasswordDto);
  }

  @Get('linked-exchanges')
  @ApiOperation({ summary: 'Get list of exchanges linked to user' })
  @ApiResponse({
    status: 200,
    description: 'List of linked exchanges retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          code: { type: 'string' },
          logo_path: { type: 'string', nullable: true },
          logo_url: { type: 'string', nullable: true },
          exchange_uid: { type: 'string' },
          linked_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getLinkedExchanges(@CurrentUser() user: User) {
    return this.profileService.getLinkedExchanges(user.id);
  }
}
