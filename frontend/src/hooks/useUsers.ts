import { useQuery } from "@tanstack/react-query";

import { listUsers } from "../api/users";

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: listUsers,
    staleTime: 5 * 60 * 1000,
  });
}
