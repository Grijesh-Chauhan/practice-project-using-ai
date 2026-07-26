import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
const defaultUserId = import.meta.env.VITE_DEFAULT_USER_ID ?? "1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-User-Id": defaultUserId,
  },
});
