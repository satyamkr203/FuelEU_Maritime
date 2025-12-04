import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoutes, setBaseline } from "../routesApi";
import type { Route } from "../../../../core/domain/Route";

export const useRoutes = (filters?: any) => {
  const qc = useQueryClient();
  const q = useQuery<Route[]>({
    queryKey: ["routes", filters],
    queryFn: async () => {
      const r = await getRoutes(filters);
      return r.data.data ?? r.data;
    },
    staleTime: 5000,
  });

  const setBase = useMutation({
    mutationFn: (routeId: string) => setBaseline(routeId).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  });

  return { ...q, setBaseline: setBase.mutateAsync };
};
