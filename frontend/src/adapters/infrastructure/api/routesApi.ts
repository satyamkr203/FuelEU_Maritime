import api from "./apiClient";

export const getRoutes = (params?: any) => api.get("/routes", { params });
export const setBaseline = (routeId: string) => api.post(`/routes/${routeId}/baseline`);
export const getComparison = () => api.get("/routes/comparison");
export const getCB = (shipId: string, year: number) => api.get("/compliance/cb", { params: { shipId, year }});
export const getAdjustedCB = (year: number) => api.get("/compliance/adjusted-cb", { params: { year }});
export const getBankRecords = (shipId: string, year: number) => api.get("/banking/records", { params: { shipId, year }});
export const bankSurplus = (body: any) => api.post("/banking/bank", body);
export const applyBanked = (body: any) => api.post("/banking/apply", body);
export const createPool = (body: any) => api.post("/pools", body);
