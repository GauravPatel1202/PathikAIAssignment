import axios from 'axios';
import { Campaign, CampaignFormData, AdGroup, AdGroupFormData } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Campaign APIs
export const getCampaigns = () => api.get<Campaign[]>('/campaigns');
export const getCampaign = (id: string) => api.get<Campaign & { ad_groups: AdGroup[] }>(`/campaigns/${id}`);
export const createCampaign = (data: CampaignFormData) => api.post<Campaign>('/campaigns', data);
export const publishCampaign = (id: string) => api.post<Campaign>(`/campaigns/${id}/publish`);
export const pauseCampaign = (id: string) => api.post<Campaign>(`/campaigns/${id}/pause`);
export const disableCampaign = (id: string) => api.post(`/campaigns/${id}/disable`);

// Ad Group APIs
export const getAdGroups = (campaignId: string) => api.get<AdGroup[]>(`/campaigns/${campaignId}/ad-groups`);
export const getAdGroup = (id: string) => api.get<AdGroup>(`/ad-groups/${id}`);
export const createAdGroup = (campaignId: string, data: AdGroupFormData) => api.post<AdGroup>(`/campaigns/${campaignId}/ad-groups`, data);
export const updateAdGroup = (id: string, data: Partial<AdGroupFormData>) => api.put<AdGroup>(`/ad-groups/${id}`, data);
export const deleteAdGroup = (id: string) => api.delete(`/ad-groups/${id}`);
export const pauseAdGroup = (id: string) => api.post<AdGroup>(`/ad-groups/${id}/pause`);
export const enableAdGroup = (id: string) => api.post<AdGroup>(`/ad-groups/${id}/enable`);

export default api;
