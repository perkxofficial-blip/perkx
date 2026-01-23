import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedExchangesAndCampaigns1769136514000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const today = new Date();
    const todayTimestamp = today.getTime();
    
    // Helper function to add days
    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    // Helper function to format date for PostgreSQL
    const formatDate = (date: Date): string => {
      return date.toISOString().replace('T', ' ').substring(0, 19);
    };

    // 1. Seed Exchanges
    const exchanges = [
      { name: 'Binance', code: 'binance', affiliate_link: 'https://accounts.binance.com/register?ref=PERKX' },
      { name: 'Bybit', code: 'bybit', affiliate_link: 'https://www.bybitglobal.com/invite?ref=PERKX' },
      { name: 'OKX', code: 'okx', affiliate_link: 'https://www.okx.com/join/PERKX' },
      { name: 'Bitget', code: 'bitget', affiliate_link: 'https://partner.bitget.com/bg/PERKX' },
      { name: 'BingX', code: 'bingx', affiliate_link: 'https://bingxdao.com/invite/PERKX' },
      { name: 'Gateio', code: 'gateio', affiliate_link: 'https://www.gate.com/referral/earn-together/invite/PERKX' },
      { name: 'Weex', code: 'weex', affiliate_link: 'https://weex.com/register?vipCode=PERKX' },
      { name: 'Kucoin', code: 'kucoin', affiliate_link: 'https://www.kucoin.com/r/rf/PERKX' },
      { name: 'Zoomex', code: 'zoomex', affiliate_link: 'https://www.zoomex.com/en/invite?ref=PERKX' },
      { name: 'Hyperliquid', code: 'hyperliquid', affiliate_link: 'app.hyperliquid.xyz/join/PERKX' },
    ];

    const exchangeIds: number[] = [];
    for (const exchange of exchanges) {
      const result = await queryRunner.query(
        `INSERT INTO exchanges (name, code, affiliate_link, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, true, NOW(), NOW())
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, affiliate_link = EXCLUDED.affiliate_link
         RETURNING id`,
        [exchange.name, exchange.code, exchange.affiliate_link],
      );
      exchangeIds.push(result[0].id);
    }

    console.log(`✅ Created ${exchanges.length} exchanges`);

    // 2. Seed Campaigns
    const campaigns = [
      // Campaign 1: Binance - Launch period (active)
      {
        exchange_id: exchangeIds[0],
        title: 'Binance New User Bonus',
        description: 'Get up to $100 bonus when you sign up and trade on Binance. Limited time offer!',
        banner_path: 'campaigns/binance-banner.png',
        redirect_url: 'https://www.binance.com/en/activity/referral-entry?ref=PERKX',
        is_active: true,
        launch_start: addDays(today, -10),
        launch_end: addDays(today, 20),
        preview_start: addDays(today, -20),
        preview_end: addDays(today, -10),
        archive_start: addDays(today, 20),
        archive_end: addDays(today, 50),
        featured: true,
        category: 'New User',
      },
      // Campaign 2: Bybit - Preview period (upcoming)
      {
        exchange_id: exchangeIds[1],
        title: 'Bybit Trading Competition',
        description: 'Join Bybit trading competition and win amazing prizes. Competition starts soon!',
        banner_path: 'campaigns/bybit-banner.png',
        redirect_url: 'https://www.bybit.com/invite?ref=PERKX',
        is_active: true,
        launch_start: addDays(today, 5),
        launch_end: addDays(today, 35),
        preview_start: addDays(today, -5),
        preview_end: addDays(today, 5),
        archive_start: addDays(today, 35),
        archive_end: addDays(today, 65),
        featured: false,
        category: 'Trading Competition',
      },
      // Campaign 3: OKX - Archive period (expired)
      {
        exchange_id: exchangeIds[2],
        title: 'OKX Cashback Program',
        description: 'Earn cashback on every trade with OKX. This campaign has ended but you can still view details.',
        banner_path: 'campaigns/okx-banner.png',
        redirect_url: 'https://www.okx.com/join/PERKX',
        is_active: true,
        launch_start: addDays(today, -60),
        launch_end: addDays(today, -30),
        preview_start: addDays(today, -70),
        preview_end: addDays(today, -60),
        archive_start: addDays(today, -30),
        archive_end: addDays(today, 10),
        featured: false,
        category: 'New User',
      },
      // Campaign 4: Bitget - Launch period (active)
      {
        exchange_id: exchangeIds[3],
        title: 'Bitget Welcome Bonus',
        description: 'New users get exclusive welcome bonus up to $50. Start trading today!',
        banner_path: 'campaigns/bitget-banner.png',
        redirect_url: 'https://www.bitget.com/en/join?ref=PERKX',
        is_active: true,
        launch_start: addDays(today, -5),
        launch_end: addDays(today, 25),
        preview_start: addDays(today, -15),
        preview_end: addDays(today, -5),
        archive_start: addDays(today, 25),
        archive_end: addDays(today, 55),
        featured: true,
        category: 'New User',
      },
      // Campaign 5: BingX - Preview period (upcoming)
      {
        exchange_id: exchangeIds[4],
        title: 'BingX Futures Trading Bonus',
        description: 'Special bonus for futures traders. Campaign launching soon!',
        banner_path: 'campaigns/bingx-banner.png',
        redirect_url: 'https://bingx.com/en-us/invite/PERKX',
        is_active: true,
        launch_start: addDays(today, 3),
        launch_end: addDays(today, 33),
        preview_start: addDays(today, -7),
        preview_end: addDays(today, 3),
        archive_start: addDays(today, 33),
        archive_end: addDays(today, 63),
        featured: false,
        category: 'Trading Competition',
      },
      // Campaign 6: Gateio - Launch period (active)
      {
        exchange_id: exchangeIds[5],
        title: 'Gateio Staking Rewards',
        description: 'Earn high APY with Gateio staking. Lock your assets and earn passive income.',
        banner_path: 'campaigns/gateio-banner.png',
        redirect_url: 'https://www.gate.io/signup/PERKX',
        is_active: true,
        launch_start: addDays(today, -15),
        launch_end: addDays(today, 15),
        preview_start: addDays(today, -25),
        preview_end: addDays(today, -15),
        archive_start: addDays(today, 15),
        archive_end: addDays(today, 45),
        featured: true,
        category: 'New User',
      },
      // Campaign 7: Weex - Archive period (expired)
      {
        exchange_id: exchangeIds[6],
        title: 'Weex Copy Trading Promotion',
        description: 'Copy trading promotion has ended. Check out our new campaigns!',
        banner_path: 'campaigns/weex-banner.png',
        redirect_url: 'https://www.weex.com/join?ref=PERKX',
        is_active: true,
        launch_start: addDays(today, -45),
        launch_end: addDays(today, -15),
        preview_start: addDays(today, -55),
        preview_end: addDays(today, -45),
        archive_start: addDays(today, -15),
        archive_end: addDays(today, 15),
        featured: false,
        category: 'Trading Competition',
      },
      // Campaign 8: Kucoin - Launch period (active)
      {
        exchange_id: exchangeIds[7],
        title: 'Kucoin Spot Trading Bonus',
        description: 'Trade spot markets and earn bonus rewards. Limited time only!',
        banner_path: 'campaigns/kucoin-banner.png',
        redirect_url: 'https://www.kucoin.com/r/PERKX',
        is_active: true,
        launch_start: addDays(today, -7),
        launch_end: addDays(today, 23),
        preview_start: addDays(today, -17),
        preview_end: addDays(today, -7),
        archive_start: addDays(today, 23),
        archive_end: addDays(today, 53),
        featured: false,
        category: 'New User',
      },
      // Campaign 9: Zoomex - Preview period (upcoming)
      {
        exchange_id: exchangeIds[8],
        title: 'Zoomex Perpetual Futures',
        description: 'New perpetual futures campaign coming soon. Stay tuned!',
        banner_path: 'campaigns/zoomex-banner.png',
        redirect_url: 'https://www.zoomex.com/join?ref=PERKX',
        is_active: true,
        launch_start: addDays(today, 7),
        launch_end: addDays(today, 37),
        preview_start: addDays(today, -3),
        preview_end: addDays(today, 7),
        archive_start: addDays(today, 37),
        archive_end: addDays(today, 67),
        featured: true,
        category: 'Trading Competition',
      },
      // Campaign 10: Hyperliquid - Launch period (active)
      {
        exchange_id: exchangeIds[9],
        title: 'Hyperliquid DeFi Integration',
        description: 'Experience decentralized trading with Hyperliquid. Get started now!',
        banner_path: 'campaigns/hyperliquid-banner.png',
        redirect_url: 'https://app.hyperliquid.xyz/join?ref=PERKX',
        is_active: true,
        launch_start: addDays(today, -3),
        launch_end: addDays(today, 27),
        preview_start: addDays(today, -13),
        preview_end: addDays(today, -3),
        archive_start: addDays(today, 27),
        archive_end: addDays(today, 57),
        featured: false,
        category: 'New User',
      },
      // Campaign 11: PerkX System Campaign (no exchange_id)
      {
        exchange_id: null,
        title: 'PerkX Welcome Campaign',
        description: 'Welcome to PerkX! Join our platform and start earning cashback from all partner exchanges. Get exclusive rewards and maximize your trading profits.',
        banner_path: 'campaigns/perkx-banner.png',
        redirect_url: null,
        is_active: true,
        launch_start: addDays(today, -20),
        launch_end: addDays(today, 10),
        preview_start: addDays(today, -30),
        preview_end: addDays(today, -20),
        archive_start: addDays(today, 10),
        archive_end: addDays(today, 40),
        featured: true,
        category: 'New User',
      },
    ];

    for (const campaign of campaigns) {
      await queryRunner.query(
        `INSERT INTO campaigns (
          exchange_id, title, description, banner_path, redirect_url, is_active,
          launch_start, launch_end, preview_start, preview_end,
          archive_start, archive_end, featured, category,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14::campaign_category_enum,
          NOW(), NOW()
        )`,
        [
          campaign.exchange_id,
          campaign.title,
          campaign.description,
          campaign.banner_path,
          campaign.redirect_url,
          campaign.is_active,
          formatDate(campaign.launch_start),
          formatDate(campaign.launch_end),
          campaign.preview_start ? formatDate(campaign.preview_start) : null,
          campaign.preview_end ? formatDate(campaign.preview_end) : null,
          campaign.archive_start ? formatDate(campaign.archive_start) : null,
          campaign.archive_end ? formatDate(campaign.archive_end) : null,
          campaign.featured,
          campaign.category,
        ],
      );
    }

    console.log(`✅ Created ${campaigns.length} campaigns`);
    console.log(`   - ${campaigns.filter(c => c.launch_start <= today && c.launch_end >= today).length} campaigns in launch period (active)`);
    console.log(`   - ${campaigns.filter(c => c.preview_start && c.preview_start <= today && c.preview_end && c.preview_end >= today && c.launch_start > today).length} campaigns in preview period (upcoming)`);
    console.log(`   - ${campaigns.filter(c => c.archive_start && c.archive_start <= today && c.archive_end && c.archive_end >= today && c.launch_end < today).length} campaigns in archive period (expired)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete campaigns
    await queryRunner.query(`
      DELETE FROM campaigns 
      WHERE title IN (
        'Binance New User Bonus',
        'Bybit Trading Competition',
        'OKX Cashback Program',
        'Bitget Welcome Bonus',
        'BingX Futures Trading Bonus',
        'Gateio Staking Rewards',
        'Weex Copy Trading Promotion',
        'Kucoin Spot Trading Bonus',
        'Zoomex Perpetual Futures',
        'Hyperliquid DeFi Integration',
        'PerkX Welcome Campaign'
      )
    `);

    // Delete exchanges
    await queryRunner.query(`
      DELETE FROM exchanges 
      WHERE code IN (
        'binance', 'bybit', 'okx', 'bitget', 'bingx',
        'gateio', 'weex', 'kucoin', 'zoomex', 'hyperliquid'
      )
    `);

    console.log('✅ Reverted exchanges and campaigns seed data');
  }
}
