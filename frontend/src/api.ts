import axios from 'axios';
import { Campaign, CampaignFormData } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getCampaigns = () => api.get<Campaign[]>('/campaigns');
export const createCampaign = (data: CampaignFormData) => api.post<Campaign>('/campaigns', data);
export const publishCampaign = (id: string) => api.post<Campaign>(`/campaigns/${id}/publish`);
export const pauseCampaign = (id: string) => api.post<Campaign>(`/campaigns/${id}/pause`);
export const disableCampaign = (id: string) => api.post(`/campaigns/${id}/disable`);

export default api;
