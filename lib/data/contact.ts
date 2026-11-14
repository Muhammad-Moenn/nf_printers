import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type ContactPayload = Record<string, unknown>;

export function submitContactRequest(payload: ContactPayload) {
  return apiClient<{ success?: boolean; [key: string]: unknown }>(
    apiEndpoints.contact,
    { method: "POST", body: { ...payload } }
  );
}
