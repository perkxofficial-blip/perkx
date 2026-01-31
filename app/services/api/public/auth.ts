import {apiClient} from "@/services/api";
import {endpoints} from "@/services/endpoints";

export async function login(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.login, payload);
}

export async function verifyInfo(query: any): Promise<Response> {
  return await apiClient.authGet(endpoints.user.verifyEmail, query);
}

export async function resend(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.resendEmail, payload);
}

export async function register(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.register, payload);
}

export async function verifyOtp(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.verifyOtp, payload);
}

export async function resendOtp(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.resendOtp, payload);
}

export async function forgotPassword(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.forgotPassword, payload);
}

export async function resetPassword(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.resetPassword, payload);
}