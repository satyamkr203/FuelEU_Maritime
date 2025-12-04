import { useQuery, useMutation } from "@tanstack/react-query";
import { getAdjustedCB, createPool } from "../routesApi";

export const useAdjustedCB = (year?: number) =>
  useQuery(["adjustedCB", year], async () => {
    if (!year) throw new Error("year required");
    const r = await getAdjustedCB(year);
    return r.data;
  }, { enabled: !!year });

export const useCreatePool = () => useMutation<any, Error, any>((body: any) => createPool(body).then(r => r.data));
