import {apiClient} from "@/services/api";

export interface ExchangeSlide {
  name: string;
  logo_url: string;
}

export interface Exchange {
  id: number;
  name: string;
  code: string;
  affiliate_link: string;
  logo_path: string;
  logo_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products: ExchangeProduct[];
}

export interface ExchangeProduct {
  id: number;
  exchange_name: string;
  exchange_signup_link: string;
  product_name: string;
  discount: number;
  default_fee_maker: number;
  default_fee_taker: number;
  final_fee_maker: number;
  final_fee_taker: number;
  ave_rebate: number;
  created_at: string;
  updated_at: string;
}

export async function getAllExchanges(): Promise<Exchange[]> {
  try {
    const response = await apiClient.publicGet(`exchanges`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    return [];
  }
}
