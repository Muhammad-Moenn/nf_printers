import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: string;
};

export function fetchSessionUser() {
  return apiClient<{ user: SessionUser | null }>(apiEndpoints.auth.me);
}
