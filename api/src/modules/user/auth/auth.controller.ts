import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query, BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';
import { LocalAuthGuard } from './guards';
import { Public } from '../../../common/decorators';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { EmailVerificationService } from './email-verification.service';
import { VerifyDto } from './dto/verify.dto';
import { ResendDto } from './dto/resend.dto';

@ApiTags('User Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    console.log('Register DTO:', registerDto);
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Get('verify')
  @ApiOperation({ summary: 'Verify user email by token' })
  @ApiQuery({
    name: 'token',
    type: String,
    required: true,
    example: 'a1b2c3d4e5f6...',
    description: 'Email verification token sent to user email',
  })
  @ApiResponse({ status: 200, description: 'Email verified successfully'})
  @ApiResponse({ status: 400, description: 'Token expired or already verified'})
  @ApiResponse({ status: 404, description: 'Invalid token', })
  @ApiOperation({ summary: 'Verify user email' })
  async verifyEmail(@Query() query: VerifyDto) {
    const { token } = query;
    const userId = await this.emailVerificationService.verify(token);
    await this.authService.markEmailVerified(userId);
    return {
      message: 'Email verified successfully',
    };
  }

  @Public()
  @Post('resend')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email resent successfully'})
  @ApiResponse({ status: 404, description: 'User not found'})
  async resend(@Body() body: ResendDto) {
    const user = await this.authService.findByUnVerifiedEmail(body.email);
    if (!user) {
      throw new BadRequestException('Email does not exist or already verified');
    }
    await this.emailVerificationService.reSend({
      id: user.id,
      email: user.email,
    });

    return {
      message: 'Verification email resent',
    };
  }
}
