import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCB, getBankRecords, bankSurplus, applyBanked } from "../routesApi";

export const useCB = (shipId?: string, year?: number) => useQuery(
  ["cb", shipId, year],
  async () => {
    if (!shipId || !year) throw new Error("shipId and year required");
    const r = await getCB(shipId, year);
    return r.data;
  },
  { enabled: !!shipId && !!year }
);

export const useBankRecords = (shipId?: string, year?: number) => useQuery(
  ["bankRecords", shipId, year],
  async () => {
    const r = await getBankRecords(shipId!, year!);
    return r.data;
  }, { enabled: !!shipId && !!year }
);

export const useBankMutations = () => {
  const qc = useQueryClient();
  const bank = useMutation((body: any) => bankSurplus(body).then(r => r.data), { onSuccess: () => qc.invalidateQueries() });
  const apply = useMutation((body: any) => applyBanked(body).then(r => r.data), { onSuccess: () => qc.invalidateQueries() });
  return { bank, apply };
};
