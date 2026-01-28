import {apiClient} from "@/services/api";
import { endpoints } from "@/services/endpoints";

export interface Campaign {
  id: number;
  title: string;
  description: string;
  redirect_url: string;
  banner_url: string;
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  try {
    const response = await apiClient.publicGet(endpoints.public.campaigns);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}
