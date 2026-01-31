import {apiClient} from "@/services/api";
import {endpoints} from "@/services/endpoints";

export async function login(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.login, payload);
}

export async function verifyInfo(query: any): Promise<Response> {
  return await apiClient.get(endpoints.user.verifyEmail, query);
}

export async function resend(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.resendEmail, payload);
}

export async function register(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.register, payload);
}