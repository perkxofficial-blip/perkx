import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, Exchange } from '../../../entities';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  ListCampaignsQueryDto,
  CampaignStatus,
} from './dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create(createCampaignDto);
    return await this.campaignRepository.save(campaign);
  }

  async findAll(queryDto: ListCampaignsQueryDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 15;
    const skip = (page - 1) * limit;

    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.exchange', 'exchange');

    // Filter by exchange_id
    if (queryDto.exchange_id !== undefined) {
      queryBuilder.andWhere('campaign.exchange_id = :exchange_id', {
        exchange_id: queryDto.exchange_id,
      });
    }

    // Filter by status
    if (queryDto.status) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (queryDto.status) {
        case CampaignStatus.ACTIVE:
          queryBuilder.andWhere(
            'campaign.launch_start <= :today AND campaign.launch_end >= :today',
            { today },
          );
          break;

        case CampaignStatus.UPCOMING:
          queryBuilder.andWhere('campaign.launch_start > :today', { today });
          break;

        case CampaignStatus.EXPIRED:
          queryBuilder.andWhere('campaign.launch_end < :today', { today });
          break;
      }
    }

    // Count total
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    queryBuilder.skip(skip).take(limit).orderBy('campaign.created_at', 'DESC');

    const campaigns = await queryBuilder.getMany();

    // Transform to include only needed exchange fields
    const data = campaigns.map((campaign) => ({
      ...campaign,
      exchange: campaign.exchange
        ? {
            id: campaign.exchange.id,
            name: campaign.exchange.name,
            code: campaign.exchange.code,
          }
        : null,
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['exchange'],
    });

    if (!campaign) {
      return null;
    }

    return {
      ...campaign,
      exchange: campaign.exchange
        ? {
            id: campaign.exchange.id,
            name: campaign.exchange.name,
            code: campaign.exchange.code,
          }
        : null,
    };
  }

  async update(
    id: number,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign | null> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });

    if (!campaign) {
      return null;
    }

    Object.assign(campaign, updateCampaignDto);
    return await this.campaignRepository.save(campaign);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.campaignRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }
}
