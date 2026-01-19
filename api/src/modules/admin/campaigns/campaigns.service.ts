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
import { StorageService } from '../../../common/storage/storage.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    private storageService: StorageService,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
    banner: Express.Multer.File,
  ): Promise<Campaign> {
    // Upload banner file
    const { path: bannerPath } =
      await this.storageService.uploadFile(banner, 'campaigns');

    // Create campaign with banner_path only
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      banner_path: bannerPath,
    });

    const savedCampaign = await this.campaignRepository.save(campaign);

    // Return with banner_url generated from banner_path
    return {
      ...savedCampaign,
      banner_url: this.getBannerUrl(savedCampaign.banner_path),
    } as Campaign;
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

    // Transform to include only needed exchange fields and banner_url
    const data = campaigns.map((campaign) => ({
      ...campaign,
      banner_url: this.getBannerUrl(campaign.banner_path),
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
      banner_url: this.getBannerUrl(campaign.banner_path),
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
    banner?: Express.Multer.File,
  ): Promise<Campaign | null> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });

    if (!campaign) {
      return null;
    }

    // If banner is provided, upload new banner and delete old one
    if (banner) {
      // Delete old banner file if exists
      if (campaign.banner_path) {
        await this.storageService.deleteFile(campaign.banner_path);
      }

      // Upload new banner
      const { path: bannerPath } =
        await this.storageService.uploadFile(banner, 'campaigns');

      updateCampaignDto = {
        ...updateCampaignDto,
        banner_path: bannerPath,
      } as any;
    }

    Object.assign(campaign, updateCampaignDto);
    const savedCampaign = await this.campaignRepository.save(campaign);

    // Return with banner_url generated from banner_path
    return {
      ...savedCampaign,
      banner_url: this.getBannerUrl(savedCampaign.banner_path),
    } as Campaign;
  }

  /**
   * Generate banner URL from banner_path based on storage configuration
   * @param bannerPath - The banner path stored in database
   * @returns The full URL to access the banner image
   */
  private getBannerUrl(bannerPath: string): string | null {
    return this.storageService.getFileUrl(bannerPath);
  }

  async remove(id: number): Promise<boolean> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    
    if (!campaign) {
      return false;
    }

    // Delete banner file if exists
    if (campaign.banner_path) {
      await this.storageService.deleteFile(campaign.banner_path);
    }

    const result = await this.campaignRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }
}
