import {apiClient} from "@/services/api";
import { endpoints } from "@/services/endpoints";

export interface Campaign {
  id: number;
  title: string;
  description: string;
  redirect_url: string;
  banner_url: string;
}

export async function getAllCampaigns(params: any): Promise<Campaign[]> {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.publicGet(`${endpoints.public.campaigns}?${query}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

export async function getFeaturedCampaigns(): Promise<Campaign[]> {
  try {
    const response = await apiClient.publicGet(endpoints.public.campaigns + '?featured=true');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

export async function getCampaign(slug: string): Promise<Campaign[]> {
  try {
    const response = await apiClient.publicGet(endpoints.public.campaigns + '/' + slug);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaign slug ' + slug + ':', error);
    return [];
  }
}