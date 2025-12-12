from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Campaign, AdGroup
from config import Config
from google_ads_service import GoogleAdsService
from datetime import datetime
import traceback
import random

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)
migrate = Migrate(app, db)
ads_service = GoogleAdsService(Config())

with app.app_context():
    db.create_all()

# ============================================
# CAMPAIGN ENDPOINTS
# ============================================

@app.route('/api/campaigns', methods=['POST'])
def create_campaign():
    try:
        data = request.json
        
        # Validation
        required_fields = ['name', 'objective', 'daily_budget', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Date parsing
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        campaign = Campaign(
            name=data['name'],
            objective=data['objective'],
            campaign_type=data.get('campaign_type', 'Demand Gen'),
            daily_budget=data['daily_budget'],
            target_cpa=data.get('target_cpa'),
            bidding_strategy=data.get('bidding_strategy', 'MAXIMIZE_CONVERSIONS'),
            start_date=start_date,
            end_date=end_date,
            ad_group_name=data.get('ad_group_name'),
            ad_headline=data.get('ad_headline'),
            ad_description=data.get('ad_description'),
            asset_url=data.get('asset_url'),
            status='DRAFT'
        )
        
        db.session.add(campaign)
        db.session.commit()
        
        return jsonify(campaign.to_dict()), 201
    
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    try:
        campaigns = Campaign.query.order_by(Campaign.created_at.desc()).all()
        return jsonify([c.to_dict() for c in campaigns]), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/campaigns/<uuid:id>', methods=['GET'])
def get_campaign(id):
    try:
        campaign = Campaign.query.get_or_404(id)
        result = campaign.to_dict()
        result['ad_groups'] = [ag.to_dict() for ag in campaign.ad_groups]
        return jsonify(result), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/campaigns/<uuid:id>/publish', methods=['POST'])
def publish_campaign(id):
    try:
        campaign = Campaign.query.get_or_404(id)
        
        if campaign.status == 'PUBLISHED':
            return jsonify({'message': 'Campaign already published', 'google_id': campaign.google_campaign_id}), 200

        # Prepare data for Google Ads
        campaign_data = campaign.to_dict()
        
        # Call Google Ads Service
        try:
            google_id = ads_service.publish_campaign(campaign_data)
        except Exception as ads_error:
            # Re-raise to be caught by outer block or handle specific generic errors
             return jsonify({'error': f"Google Ads API Error: {str(ads_error)}"}), 500
        
        # Update Local DB
        campaign.google_campaign_id = google_id
        campaign.status = 'PUBLISHED'
        db.session.commit()
        
        return jsonify(campaign.to_dict()), 200
        
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/campaigns/<uuid:id>/pause', methods=['POST'])
def pause_campaign(id):
    try:
        campaign = Campaign.query.get_or_404(id)
        
        if campaign.status != 'PUBLISHED':
            return jsonify({'message': 'Campaign must be PUBLISHED to be paused'}), 400

        # Call Google Ads Service
        try:
            ads_service.pause_campaign(campaign.google_campaign_id)
        except Exception as ads_error:
            return jsonify({'error': f"Google Ads API Error: {str(ads_error)}"}), 500
        
        # Update Local DB
        campaign.status = 'PAUSED'
        db.session.commit()
        
        return jsonify(campaign.to_dict()), 200
        
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ============================================
# AD GROUP ENDPOINTS
# ============================================

@app.route('/api/campaigns/<uuid:campaign_id>/ad-groups', methods=['GET'])
def get_ad_groups(campaign_id):
    """Get all ad groups for a campaign"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        ad_groups = AdGroup.query.filter_by(campaign_id=campaign_id).order_by(AdGroup.created_at.desc()).all()
        return jsonify([ag.to_dict() for ag in ad_groups]), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/campaigns/<uuid:campaign_id>/ad-groups', methods=['POST'])
def create_ad_group(campaign_id):
    """Create a new ad group for a campaign"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        data = request.json
        
        # Validation
        if 'name' not in data:
            return jsonify({'error': 'Missing field: name'}), 400

        ad_group = AdGroup(
            campaign_id=campaign_id,
            name=data['name'],
            status=data.get('status', 'ENABLED'),
            target_audience=data.get('target_audience'),
            keywords=data.get('keywords'),
            cpc_bid=data.get('cpc_bid'),
            cpm_bid=data.get('cpm_bid'),
            ad_headline=data.get('ad_headline'),
            ad_headline_2=data.get('ad_headline_2'),
            ad_headline_3=data.get('ad_headline_3'),
            ad_description=data.get('ad_description'),
            ad_description_2=data.get('ad_description_2'),
            final_url=data.get('final_url'),
            display_url=data.get('display_url')
        )
        
        db.session.add(ad_group)
        db.session.commit()
        
        return jsonify(ad_group.to_dict()), 201
    
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/ad-groups/<uuid:id>', methods=['GET'])
def get_ad_group(id):
    """Get a single ad group by ID"""
    try:
        ad_group = AdGroup.query.get_or_404(id)
        return jsonify(ad_group.to_dict()), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/ad-groups/<uuid:id>', methods=['PUT'])
def update_ad_group(id):
    """Update an ad group"""
    try:
        ad_group = AdGroup.query.get_or_404(id)
        data = request.json
        
        # Update fields
        if 'name' in data:
            ad_group.name = data['name']
        if 'status' in data:
            ad_group.status = data['status']
        if 'target_audience' in data:
            ad_group.target_audience = data['target_audience']
        if 'keywords' in data:
            ad_group.keywords = data['keywords']
        if 'cpc_bid' in data:
            ad_group.cpc_bid = data['cpc_bid']
        if 'cpm_bid' in data:
            ad_group.cpm_bid = data['cpm_bid']
        if 'ad_headline' in data:
            ad_group.ad_headline = data['ad_headline']
        if 'ad_headline_2' in data:
            ad_group.ad_headline_2 = data['ad_headline_2']
        if 'ad_headline_3' in data:
            ad_group.ad_headline_3 = data['ad_headline_3']
        if 'ad_description' in data:
            ad_group.ad_description = data['ad_description']
        if 'ad_description_2' in data:
            ad_group.ad_description_2 = data['ad_description_2']
        if 'final_url' in data:
            ad_group.final_url = data['final_url']
        if 'display_url' in data:
            ad_group.display_url = data['display_url']
        
        db.session.commit()
        
        return jsonify(ad_group.to_dict()), 200
    
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/ad-groups/<uuid:id>', methods=['DELETE'])
def delete_ad_group(id):
    """Delete an ad group"""
    try:
        ad_group = AdGroup.query.get_or_404(id)
        db.session.delete(ad_group)
        db.session.commit()
        
        return jsonify({'message': 'Ad group deleted successfully'}), 200
    
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/ad-groups/<uuid:id>/pause', methods=['POST'])
def pause_ad_group(id):
    """Pause an ad group"""
    try:
        ad_group = AdGroup.query.get_or_404(id)
        ad_group.status = 'PAUSED'
        db.session.commit()
        
        return jsonify(ad_group.to_dict()), 200
    
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/ad-groups/<uuid:id>/enable', methods=['POST'])
def enable_ad_group(id):
    """Enable an ad group"""
    try:
        ad_group = AdGroup.query.get_or_404(id)
        ad_group.status = 'ENABLED'
        db.session.commit()
        
        return jsonify(ad_group.to_dict()), 200
    
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
