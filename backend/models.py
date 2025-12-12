from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID

db = SQLAlchemy()

class Campaign(db.Model):
    __tablename__ = 'campaigns'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(255), nullable=False)
    objective = db.Column(db.String(100), nullable=False)
    campaign_type = db.Column(db.String(100), default="Demand Gen") # e.g., Demand Gen
    daily_budget = db.Column(db.Integer, nullable=False) # In micros potentially, but let's stick to standard units and convert
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default="DRAFT") # DRAFT, PUBLISHED
    
    # Google Ads Specific
    google_campaign_id = db.Column(db.String(255), nullable=True)
    ad_group_name = db.Column(db.String(255), nullable=True)
    ad_headline = db.Column(db.String(255), nullable=True)
    ad_description = db.Column(db.Text, nullable=True)
    asset_url = db.Column(db.String(500), nullable=True)
    
    # Bidding
    target_cpa = db.Column(db.Float, nullable=True)
    bidding_strategy = db.Column(db.String(50), default="MAXIMIZE_CONVERSIONS")
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to ad groups
    ad_groups = db.relationship('AdGroup', backref='campaign', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'objective': self.objective,
            'campaign_type': self.campaign_type,
            'daily_budget': self.daily_budget,
            'target_cpa': self.target_cpa,
            'bidding_strategy': self.bidding_strategy,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'google_campaign_id': self.google_campaign_id,
            'ad_group_name': self.ad_group_name,
            'ad_headline': self.ad_headline,
            'ad_description': self.ad_description,
            'asset_url': self.asset_url,
            'created_at': self.created_at.isoformat(),
            'ad_groups_count': len(self.ad_groups)
        }


class AdGroup(db.Model):
    __tablename__ = 'ad_groups'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = db.Column(UUID(as_uuid=True), db.ForeignKey('campaigns.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default="ENABLED")  # ENABLED, PAUSED, REMOVED
    
    # Targeting
    target_audience = db.Column(db.String(255), nullable=True)
    keywords = db.Column(db.Text, nullable=True)  # Comma-separated keywords
    
    # Bidding
    cpc_bid = db.Column(db.Float, nullable=True)  # Cost per click in dollars
    cpm_bid = db.Column(db.Float, nullable=True)  # Cost per thousand impressions
    
    # Ad Creative
    ad_headline = db.Column(db.String(255), nullable=True)
    ad_headline_2 = db.Column(db.String(255), nullable=True)
    ad_headline_3 = db.Column(db.String(255), nullable=True)
    ad_description = db.Column(db.Text, nullable=True)
    ad_description_2 = db.Column(db.Text, nullable=True)
    final_url = db.Column(db.String(500), nullable=True)
    display_url = db.Column(db.String(255), nullable=True)
    
    # Google Ads Specific
    google_ad_group_id = db.Column(db.String(255), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'campaign_id': str(self.campaign_id),
            'name': self.name,
            'status': self.status,
            'target_audience': self.target_audience,
            'keywords': self.keywords,
            'cpc_bid': self.cpc_bid,
            'cpm_bid': self.cpm_bid,
            'ad_headline': self.ad_headline,
            'ad_headline_2': self.ad_headline_2,
            'ad_headline_3': self.ad_headline_3,
            'ad_description': self.ad_description,
            'ad_description_2': self.ad_description_2,
            'final_url': self.final_url,
            'display_url': self.display_url,
            'google_ad_group_id': self.google_ad_group_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
