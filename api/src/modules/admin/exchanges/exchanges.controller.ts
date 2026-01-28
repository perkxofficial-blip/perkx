import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminExchangesService } from './exchanges.service';
import { AdminJwtAuthGuard } from '../auth/guards';

@ApiTags('Admin - Exchanges')
@ApiBearerAuth('admin-jwt')
@Controller('admin/exchanges')
@UseGuards(AdminJwtAuthGuard)
export class AdminExchangesController {
  constructor(private readonly exchangesService: AdminExchangesService) {}

  @Get('list')
  @ApiOperation({
    summary: 'Get list of active exchanges',
    description: 'Returns list of active exchanges with id and name. Includes a special PerkX item with id: 0.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of exchanges retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Exchange ID. 0 for PerkX', example: 0 },
          name: { type: 'string', description: 'Exchange name', example: 'PerkX' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  async getExchangeList() {
    return await this.exchangesService.getExchangeList();
  }
}
