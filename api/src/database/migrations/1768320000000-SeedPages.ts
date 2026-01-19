import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPages1768320000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const pages = [
      {
        slug: 'home',
        content: {
          en: {
            title: 'Home',
            description: 'Welcome to PerkX - Leading Cashback Platform',
            content: '<div class="hero-section"><h1>Earn Cashback on Crypto Trading</h1><p>Join PerkX to receive cashback from top exchanges</p></div>',
            is_published: true,
            seo: {
              meta_title: 'PerkX - Leading Crypto Cashback Platform',
              meta_description: 'Earn cashback when trading on trusted crypto exchanges. Join now to maximize your profits.',
              meta_keywords: ['cashback', 'crypto', 'trading', 'rewards'],
              og_title: 'PerkX - Crypto Cashback',
              og_description: 'Leading crypto cashback platform',
            },
          },
          ko: {
            title: '홈',
            description: 'PerkX에 오신 것을 환영합니다 - 선도적인 캐시백 플랫폼',
            content: '<div class="hero-section"><h1>암호화폐 거래로 캐시백 받기</h1><p>최고의 거래소에서 캐시백을 받으려면 PerkX에 가입하세요</p></div>',
            is_published: true,
            seo: {
              meta_title: 'PerkX - 선도적인 암호화폐 캐시백 플랫폼',
              meta_description: '신뢰할 수 있는 암호화폐 거래소에서 거래할 때 캐시백을 받으세요. 지금 가입하여 수익을 극대화하세요.',
              meta_keywords: ['캐시백', '암호화폐', '거래', '보상'],
              og_title: 'PerkX - 암호화폐 캐시백',
              og_description: '선도적인 암호화폐 캐시백 플랫폼',
            },
          },
        },
      },
      {
        slug: 'campaigns',
        content: {
          en: {
            title: 'Campaigns',
            description: 'Discover special promotions and cashback programs',
            content: '<div class="campaigns-section"><h1>Active Campaigns</h1><p>Join now to get the best deals</p></div>',
            is_published: true,
            seo: {
              meta_title: 'Cashback Campaigns - PerkX',
              meta_description: 'List of special cashback campaigns and promotions from top exchanges.',
              meta_keywords: ['campaigns', 'promotions', 'cashback', 'deals'],
            },
          },
          ko: {
            title: '캠페인',
            description: '특별 프로모션 및 캐시백 프로그램 찾기',
            content: '<div class="campaigns-section"><h1>진행 중인 캠페인</h1><p>최고의 거래를 받으려면 지금 가입하세요</p></div>',
            is_published: true,
            seo: {
              meta_title: '캐시백 캠페인 - PerkX',
              meta_description: '최고의 거래소의 특별 캐시백 캠페인 및 프로모션 목록.',
              meta_keywords: ['캠페인', '프로모션', '캐시백', '거래'],
            },
          },
        },
      },
      {
        slug: 'campaign-detail',
        content: {
          en: {
            title: 'Campaign Detail',
            description: 'Detailed information about cashback program',
            content: '<div class="campaign-detail"><h1>Campaign Information</h1><p>View terms and conditions and how to participate</p></div>',
            is_published: true,
            seo: {
              meta_title: 'Campaign Detail - PerkX',
              meta_description: 'Complete information about cashback program, terms and participation guide.',
            },
          },
          ko: {
            title: '캠페인 세부정보',
            description: '캐시백 프로그램에 대한 자세한 정보',
            content: '<div class="campaign-detail"><h1>캠페인 정보</h1><p>약관 및 참여 방법 보기</p></div>',
            is_published: true,
            seo: {
              meta_title: '캠페인 세부정보 - PerkX',
              meta_description: '캐시백 프로그램, 약관 및 참여 가이드에 대한 전체 정보.',
            },
          },
        },
      },
      {
        slug: 'exchanges',
        content: {
          en: {
            title: 'Partner Exchanges',
            description: 'Trusted crypto exchanges partnered with PerkX',
            content: '<div class="exchanges-section"><h1>Partner Exchanges</h1><p>Connect with top exchanges to earn cashback</p><ul><li>Binance</li><li>Bybit</li><li>OKX</li><li>Gate.io</li></ul></div>',
            is_published: true,
            seo: {
              meta_title: 'Partner Exchanges - PerkX',
              meta_description: 'List of crypto exchanges partnered with PerkX. Trade and earn cashback now.',
              meta_keywords: ['exchanges', 'trading', 'binance', 'bybit', 'okx'],
            },
          },
          ko: {
            title: '파트너 거래소',
            description: 'PerkX와 파트너십을 맺은 신뢰할 수 있는 암호화폐 거래소',
            content: '<div class="exchanges-section"><h1>파트너 거래소</h1><p>최고의 거래소와 연결하여 캐시백 받기</p><ul><li>바이낸스</li><li>바이비트</li><li>OKX</li><li>게이트</li></ul></div>',
            is_published: true,
            seo: {
              meta_title: '파트너 거래소 - PerkX',
              meta_description: 'PerkX와 파트너십을 맺은 암호화폐 거래소 목록. 지금 거래하고 캐시백을 받으세요.',
              meta_keywords: ['거래소', '거래', '바이낸스', '바이비트', 'okx'],
            },
          },
        },
      },
      {
        slug: 'cashback-calculator',
        content: {
          en: {
            title: 'Cashback Calculator',
            description: 'Calculate how much cashback you can earn',
            content: '<div class="calculator-section"><h1>Calculate Your Cashback</h1><p>Enter your trading volume to see estimated cashback</p><div class="calculator-widget"><!-- Calculator component will be here --></div></div>',
            is_published: true,
            seo: {
              meta_title: 'Cashback Calculator - PerkX',
              meta_description: 'Calculate how much cashback you can earn from your crypto trading volume.',
              meta_keywords: ['calculator', 'cashback', 'earnings', 'rewards'],
            },
          },
          ko: {
            title: '캐시백 계산기',
            description: '받을 수 있는 캐시백 계산',
            content: '<div class="calculator-section"><h1>캐시백 계산하기</h1><p>거래량을 입력하여 예상 캐시백 보기</p><div class="calculator-widget"><!-- Calculator component will be here --></div></div>',
            is_published: true,
            seo: {
              meta_title: '캐시백 계산기 - PerkX',
              meta_description: '암호화폐 거래량에서 얼마나 많은 캐시백을 받을 수 있는지 계산하세요.',
              meta_keywords: ['계산기', '캐시백', '수익', '보상'],
            },
          },
        },
      },
      {
        slug: 'how-it-works',
        content: {
          en: {
            title: 'How It Works',
            description: 'Guide to earning cashback with PerkX',
            content: '<div class="how-it-works"><h1>How Does PerkX Work?</h1><div class="steps"><div class="step"><h3>Step 1: Sign Up</h3><p>Create a free PerkX account</p></div><div class="step"><h3>Step 2: Connect Exchange</h3><p>Link your exchange account</p></div><div class="step"><h3>Step 3: Trade & Earn</h3><p>Trade normally and automatically earn cashback</p></div></div></div>',
            is_published: true,
            seo: {
              meta_title: 'How It Works - PerkX',
              meta_description: 'Detailed guide on earning cashback when trading crypto through PerkX.',
              meta_keywords: ['guide', 'how to', 'cashback', 'tutorial'],
            },
          },
          ko: {
            title: '작동 방식',
            description: 'PerkX로 캐시백 받는 가이드',
            content: '<div class="how-it-works"><h1>PerkX는 어떻게 작동하나요?</h1><div class="steps"><div class="step"><h3>1단계: 가입</h3><p>무료 PerkX 계정 만들기</p></div><div class="step"><h3>2단계: 거래소 연결</h3><p>거래소 계정 연결하기</p></div><div class="step"><h3>3단계: 거래 및 수익</h3><p>정상적으로 거래하고 자동으로 캐시백 받기</p></div></div></div>',
            is_published: true,
            seo: {
              meta_title: '작동 방식 - PerkX',
              meta_description: 'PerkX를 통해 암호화폐 거래 시 캐시백을 받는 방법에 대한 자세한 가이드.',
              meta_keywords: ['가이드', '방법', '캐시백', '튜토리얼'],
            },
          },
        },
      },
      {
        slug: 'about-us',
        content: {
          en: {
            title: 'About Us',
            description: 'Learn about PerkX and our mission',
            content: '<div class="about-section"><h1>About PerkX</h1><p>PerkX is the leading cashback platform for crypto traders.</p><h2>Mission</h2><p>Help traders optimize profits through attractive cashback programs.</p><h2>Vision</h2><p>Become the #1 crypto cashback platform globally.</p></div>',
            is_published: true,
            seo: {
              meta_title: 'About Us - PerkX',
              meta_description: 'Learn about PerkX, our mission and vision in bringing value to crypto traders.',
              meta_keywords: ['about us', 'perkx', 'company', 'mission'],
            },
          },
          ko: {
            title: '회사 소개',
            description: 'PerkX와 우리의 사명에 대해 알아보세요',
            content: '<div class="about-section"><h1>PerkX 소개</h1><p>PerkX는 암호화폐 트레이더를 위한 선도적인 캐시백 플랫폼입니다.</p><h2>사명</h2><p>매력적인 캐시백 프로그램을 통해 트레이더의 수익 최적화를 돕습니다.</p><h2>비전</h2><p>전 세계 1위 암호화폐 캐시백 플랫폼이 되는 것입니다.</p></div>',
            is_published: true,
            seo: {
              meta_title: '회사 소개 - PerkX',
              meta_description: 'PerkX, 암호화폐 트레이더에게 가치를 제공하는 우리의 사명과 비전에 대해 알아보세요.',
              meta_keywords: ['회사 소개', 'perkx', '회사', '사명'],
            },
          },
        },
      },
      {
        slug: 'legal-privacy',
        content: {
          en: {
            title: 'Legal & Privacy',
            description: 'Terms of service and privacy policy',
            content: '<div class="legal-section"><h1>Terms of Service</h1><p>Last updated: ' + new Date().toLocaleDateString('en-US') + '</p><h2>1. Acceptance of Terms</h2><p>By using PerkX services, you agree to these terms.</p><h2>2. Privacy Policy</h2><p>We are committed to protecting your personal information.</p><h2>3. Rights and Responsibilities</h2><p>Details about user rights and responsibilities.</p></div>',
            is_published: true,
            seo: {
              meta_title: 'Legal & Privacy - PerkX',
              meta_description: 'Terms of service and privacy policy of PerkX.',
              meta_keywords: ['terms', 'privacy', 'policy', 'legal'],
            },
          },
          ko: {
            title: '법률 및 개인정보',
            description: '서비스 약관 및 개인정보 보호정책',
            content: '<div class="legal-section"><h1>서비스 약관</h1><p>최종 업데이트: ' + new Date().toLocaleDateString('ko-KR') + '</p><h2>1. 약관 동의</h2><p>PerkX 서비스를 이용함으로써 본 약관에 동의하게 됩니다.</p><h2>2. 개인정보 보호정책</h2><p>우리는 귀하의 개인 정보를 보호하기 위해 최선을 다하고 있습니다.</p><h2>3. 권리 및 책임</h2><p>사용자 권리 및 책임에 대한 세부 정보.</p></div>',
            is_published: true,
            seo: {
              meta_title: '법률 및 개인정보 - PerkX',
              meta_description: 'PerkX의 서비스 약관 및 개인정보 보호정책.',
              meta_keywords: ['약관', '개인정보', '정책', '법률'],
            },
          },
        },
      },
      {
        slug: 'cookie-policy',
        content: {
          en: {
            title: 'Cookie Policy',
            description: 'How we use cookies',
            content: '<div class="cookie-policy"><h1>Cookie Policy</h1><p>Updated: ' + new Date().toLocaleDateString('en-US') + '</p><h2>What are Cookies?</h2><p>Cookies are small text files stored on your device.</p><h2>How We Use Cookies</h2><ul><li>Improve user experience</li><li>Analyze traffic</li><li>Personalize content</li></ul><h2>Managing Cookies</h2><p>You can manage cookies through your browser settings.</p></div>',
            is_published: true,
            seo: {
              meta_title: 'Cookie Policy - PerkX',
              meta_description: 'Learn how PerkX uses cookies and how to manage them.',
              meta_keywords: ['cookie', 'policy', 'privacy', 'tracking'],
            },
          },
          ko: {
            title: '쿠키 정책',
            description: '쿠키 사용 방법',
            content: '<div class="cookie-policy"><h1>쿠키 정책</h1><p>업데이트: ' + new Date().toLocaleDateString('ko-KR') + '</p><h2>쿠키란 무엇인가요?</h2><p>쿠키는 귀하의 장치에 저장되는 작은 텍스트 파일입니다.</p><h2>쿠키 사용 방법</h2><ul><li>사용자 경험 개선</li><li>트래픽 분석</li><li>콘텐츠 개인화</li></ul><h2>쿠키 관리</h2><p>브라우저 설정을 통해 쿠키를 관리할 수 있습니다.</p></div>',
            is_published: true,
            seo: {
              meta_title: '쿠키 정책 - PerkX',
              meta_description: 'PerkX가 쿠키를 사용하는 방법과 관리 방법을 알아보세요.',
              meta_keywords: ['쿠키', '정책', '개인정보', '추적'],
            },
          },
        },
      },
      {
        slug: 'zendesk-widget',
        content: {
          en: {
            title: 'Customer Support',
            description: 'Contact our support team',
            content: '<div class="support-section"><h1>Customer Support</h1><p>We are here to help you 24/7</p><div class="support-options"><h2>Support Channels</h2><ul><li>Live Chat (bottom right corner)</li><li>Email: support@perkx.com</li><li>Telegram Community</li></ul></div><div class="faq"><h2>Frequently Asked Questions</h2><p>Find quick answers in our FAQ section.</p></div></div>',
            is_published: true,
            seo: {
              meta_title: 'Customer Support - PerkX',
              meta_description: 'Contact PerkX support team via Live Chat, Email or Telegram.',
              meta_keywords: ['support', 'help', 'contact', 'customer service'],
            },
          },
          ko: {
            title: '고객 지원',
            description: '지원팀에 문의하기',
            content: '<div class="support-section"><h1>고객 지원</h1><p>24시간 연중무휴로 도와드리겠습니다</p><div class="support-options"><h2>지원 채널</h2><ul><li>라이브 채팅 (오른쪽 하단)</li><li>이메일: support@perkx.com</li><li>텔레그램 커뮤니티</li></ul></div><div class="faq"><h2>자주 묻는 질문</h2><p>FAQ 섹션에서 빠른 답변을 찾으세요.</p></div></div>',
            is_published: true,
            seo: {
              meta_title: '고객 지원 - PerkX',
              meta_description: '라이브 채팅, 이메일 또는 텔레그램을 통해 PerkX 지원팀에 문의하세요.',
              meta_keywords: ['지원', '도움말', '문의', '고객 서비스'],
            },
          },
        },
      },
    ];

    for (const page of pages) {
      await queryRunner.query(
        `INSERT INTO pages (slug, content, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())`,
        [page.slug, JSON.stringify(page.content)],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const slugs = [
      'home',
      'campaigns',
      'campaign-detail',
      'exchanges',
      'cashback-calculator',
      'how-it-works',
      'about-us',
      'legal-privacy',
      'cookie-policy',
      'zendesk-widget',
    ];

    for (const slug of slugs) {
      await queryRunner.query(`DELETE FROM pages WHERE slug = $1`, [slug]);
    }
  }
}
