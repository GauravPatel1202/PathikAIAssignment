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
  ad_groups_count?: number;
  
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

export interface AdGroup {
  id: string;
  campaign_id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  target_audience?: string;
  keywords?: string;
  cpc_bid?: number;
  cpm_bid?: number;
  ad_headline?: string;
  ad_headline_2?: string;
  ad_headline_3?: string;
  ad_description?: string;
  ad_description_2?: string;
  final_url?: string;
  display_url?: string;
  google_ad_group_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdGroupFormData {
  name: string;
  target_audience?: string;
  keywords?: string;
  cpc_bid?: number;
  cpm_bid?: number;
  ad_headline?: string;
  ad_headline_2?: string;
  ad_headline_3?: string;
  ad_description?: string;
  ad_description_2?: string;
  final_url?: string;
  display_url?: string;
}
