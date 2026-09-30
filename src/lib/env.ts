const API_URL_FALLBACK = "http://localhost:5000/api/v1";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get apiUrl() {
    return typeof window !== "undefined"
      ? "/api/proxy"
      : (process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? API_URL_FALLBACK);
  },
  jwt: {
    get accessSecret() {
      return requireEnv("JWT_ACCESS_SECRET");
    },
    get refreshSecret() {
      return requireEnv("JWT_REFRESH_SECRET");
    },
  },
};
