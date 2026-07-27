import { apiClient } from "./client";
import type { User } from "../types";

export async function listUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>("/users");
  return response.data;
}
