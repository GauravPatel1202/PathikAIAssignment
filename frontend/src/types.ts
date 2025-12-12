export interface Campaign {
  id: string;
  name: string;
  objective: string;
  campaign_type: string;
  daily_budget: number;
  start_date: string;
  end_date: string;
  status: 'DRAFT' | 'PUBLISHED' | 'PAUSED';
  google_campaign_id?: string;
  ad_group_name?: string;
  ad_headline?: string;
  ad_description?: string;
  asset_url?: string;
  created_at: string;
  
  // Performance Stats (Mocked)
  impressions?: number;
  clicks?: number;
  cost?: number;
  conversions?: number;
  conversion_value?: number;
  roas?: number;
}

export interface CampaignFormData {
  name: string;
  objective: string;
  campaign_type: string;
  daily_budget: number;
  start_date: string;
  end_date: string;
  ad_group_name: string;
  ad_headline: string;
  ad_description: string;
  asset_url: string;
  target_cpa?: number;
  bidding_strategy?: string;
}
