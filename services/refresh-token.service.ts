import { apiClient } from "@/services/api.service";

const AUTH_PATH = "/auth";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function getNewAccessToken(refreshToken: string): Promise<AuthTokens | null> {
  try {
    return await apiClient.post<AuthTokens>(`${AUTH_PATH}/refresh-token`, undefined, {
      headers: {
        Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
      },
    });
  } catch {
    return null;
  }
}
