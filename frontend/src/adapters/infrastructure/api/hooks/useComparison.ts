import { useQuery } from "@tanstack/react-query";
import { getComparison } from "../routesApi";

export const useComparison = () =>
  useQuery({
    queryKey: ["comparison"],
    queryFn: async () => {
      const r = await getComparison();
      return r.data;
    },
  });