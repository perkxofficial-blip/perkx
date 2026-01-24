import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PublicExchangesService } from './exchanges.service';
import { Public } from '../../../common/decorators';

@ApiTags('Public - Exchanges')
@Controller('exchanges')
export class PublicExchangesController {
  constructor(private readonly exchangesService: PublicExchangesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all active exchanges (public, no authentication required)',
    description: 'Returns all exchanges where is_active is true. Logo URLs are always local links in the uploads folder.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of exchanges retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          code: { type: 'string' },
          affiliate_link: { type: 'string' },
          logo_path: { type: 'string', nullable: true },
          logo_url: { type: 'string', nullable: true },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAll() {
    return await this.exchangesService.findAll();
  }
}
