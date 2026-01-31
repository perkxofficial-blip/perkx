import {apiClient} from "@/services/api";
import {endpoints} from "@/services/endpoints";

export async function login(payload: any): Promise<Response> {
  return await apiClient.authPost(endpoints.user.login, payload);
}
