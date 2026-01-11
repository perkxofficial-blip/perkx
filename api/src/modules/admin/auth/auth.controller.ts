import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLocalAuthGuard } from './guards';
import { Public } from '../../../common/decorators';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(AdminLocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Admin successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
