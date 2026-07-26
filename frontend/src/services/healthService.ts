import axios from "axios";

/** Scaffold-only health probe against unversioned /health. */
export interface HealthResponse {
  status: string;
}

function apiOrigin(): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
  return apiUrl.replace(/\/api\/v1\/?$/, "");
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await axios.get<HealthResponse>(`${apiOrigin()}/health`);
  return response.data;
}
