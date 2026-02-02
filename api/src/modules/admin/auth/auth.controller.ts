import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLocalAuthGuard } from './guards';
import { Public } from '../../../common/decorators';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AdminResetPasswordDto, ForgotPasswordDto } from './dto';

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

  @Public()
  @Post('forgot-password')
  @ApiOperation({ 
    summary: 'Request password reset for admin',
    description: 'Sends a password reset email to the admin. The email will contain a secure link with a token that expires in 24 hours.'
  })
  @ApiBody({ 
    type: ForgotPasswordDto,
    description: 'Admin email address to send password reset link'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset email sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password reset email sent successfully'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Admin with this email does not exist',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400
        },
        message: {
          type: 'string',
          example: 'Admin with this email does not exist'
        }
      }
    }
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Reset admin password using token',
    description: 'Resets admin password using the token received via email. The token can only be used once and expires in 24 hours.'
  })
  @ApiBody({ 
    type: AdminResetPasswordDto,
    description: 'Reset token and new password'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password reset successfully'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired reset token',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400
        },
        message: {
          type: 'string',
          example: 'Invalid or expired reset token'
        }
      }
    }
  })
  async resetPassword(@Body() resetPasswordDto: AdminResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
