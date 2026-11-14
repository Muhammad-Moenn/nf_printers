import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

export function deleteUploadedFile(key: string) {
  return apiClient<unknown>(apiEndpoints.uploads.delete, {
    method: "POST",
    body: { key },
  });
}
