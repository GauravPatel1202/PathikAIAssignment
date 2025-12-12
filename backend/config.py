import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    # Defaulting to a common local setup, user can override via .env
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://localhost/campaign_manager')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Google Ads
    GOOGLE_ADS_DEVELOPER_TOKEN = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
    GOOGLE_ADS_CLIENT_ID = os.getenv('GOOGLE_ADS_CLIENT_ID')
    GOOGLE_ADS_CLIENT_SECRET = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
    GOOGLE_ADS_REFRESH_TOKEN = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')
    GOOGLE_ADS_LOGIN_CUSTOMER_ID = os.getenv('GOOGLE_ADS_LOGIN_CUSTOMER_ID')
    GOOGLE_ADS_CUSTOMER_ID = os.getenv('GOOGLE_ADS_CUSTOMER_ID')
    
    # Helper to check if ads config is present
    @property
    def has_google_ads_config(self):
        return all([
            self.GOOGLE_ADS_DEVELOPER_TOKEN,
            self.GOOGLE_ADS_CLIENT_ID,
            self.GOOGLE_ADS_CLIENT_SECRET,
            self.GOOGLE_ADS_REFRESH_TOKEN,
            self.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
            self.GOOGLE_ADS_CUSTOMER_ID
        ])
    
    def get_google_ads_config_dict(self):
        return {
            "developer_token": self.GOOGLE_ADS_DEVELOPER_TOKEN,
            "client_id": self.GOOGLE_ADS_CLIENT_ID,
            "client_secret": self.GOOGLE_ADS_CLIENT_SECRET,
            "refresh_token": self.GOOGLE_ADS_REFRESH_TOKEN,
            "login_customer_id": self.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
            "use_proto_plus": True
        }
