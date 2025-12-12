from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Campaign
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
