import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from '../../../entities';

export type ExchangeListItem = {
  id: number;
  name: string;
};

@Injectable()
export class AdminExchangesService {
  constructor(
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
  ) {}

  async getExchangeList(): Promise<ExchangeListItem[]> {
    // Get all active exchanges
    const activeExchanges = await this.exchangeRepository.find({
      where: { is_active: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });

    // Add PerkX as first item with id: null
    const perkXItem: ExchangeListItem = {
      id: null,
      name: 'PerkX',
    };

    return [perkXItem, ...activeExchanges];
  }
}
