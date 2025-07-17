import os
import requests
import json
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

class APIIntegrationService:
    """Centralized API integration service for external platforms"""
    
    def __init__(self):
        # Load environment variables
        self.woo_consumer_key = os.getenv('WOO_CONSUMER_KEY')
        self.woo_consumer_secret = os.getenv('WOO_CONSUMER_SECRET')
        self.woo_api_url = os.getenv('WOO_API_URL')
        self.merchantguy_api_key = os.getenv('MERCHANTGUY_API_KEY')
        self.merchantguy_gateway_url = os.getenv('MERCHANTGUY_GATEWAY_URL')
        
        # Load additional API keys from config if available
        self.config_path = '../config/config.json'
        self.api_keys = self._load_config()
    
    def _load_config(self) -> Dict[str, str]:
        """Load API keys from config file"""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading config: {e}")
        return {}
    
    def _save_config(self, config: Dict[str, str]) -> bool:
        """Save API keys to config file"""
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False
    
    def save_api_key(self, platform: str, api_key: str) -> bool:
        """Save API key for a platform"""
        self.api_keys[f"{platform}_api_key"] = api_key
        return self._save_config(self.api_keys)
    
    def validate_api_key(self, platform: str, api_key: str) -> bool:
        """Validate API key for a platform"""
        try:
            if platform == 'google_analytics':
                return self._validate_google_analytics(api_key)
            elif platform == 'google_ads':
                return self._validate_google_ads(api_key)
            elif platform == 'facebook':
                return self._validate_facebook(api_key)
            elif platform == 'tiktok':
                return self._validate_tiktok(api_key)
            elif platform == 'twitter':
                return self._validate_twitter(api_key)
            elif platform == 'youtube':
                return self._validate_youtube(api_key)
            else:
                return False
        except Exception as e:
            print(f"Error validating {platform} API key: {e}")
            return False
    
    # WooCommerce Integration (Read-only)
    def get_woocommerce_data(self, action: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get data from WooCommerce API (read-only)"""
        try:
            if not all([self.woo_consumer_key, self.woo_consumer_secret, self.woo_api_url]):
                return {"error": "WooCommerce credentials not configured"}
            
            base_url = f"{self.woo_api_url}/wp-json/wc/v3"
            auth = (self.woo_consumer_key, self.woo_consumer_secret)
            
            if action == 'customers':
                response = requests.get(f"{base_url}/customers", auth=auth, params=params or {})
            elif action == 'orders':
                response = requests.get(f"{base_url}/orders", auth=auth, params=params or {})
            elif action == 'products':
                response = requests.get(f"{base_url}/products", auth=auth, params=params or {})
            elif action == 'reports':
                response = requests.get(f"{base_url}/reports", auth=auth, params=params or {})
            else:
                return {"error": f"Unsupported WooCommerce action: {action}"}
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"error": f"WooCommerce API error: {response.status_code} - {response.text}"}
                
        except Exception as e:
            return {"error": f"WooCommerce integration error: {str(e)}"}
    
    # MerchantGuy Integration (Read-only)
    def get_merchantguy_data(self, action: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get data from MerchantGuy API (read-only)"""
        try:
            if not all([self.merchantguy_api_key, self.merchantguy_gateway_url]):
                return {"error": "MerchantGuy credentials not configured"}
            
            base_url = f"{self.merchantguy_gateway_url}/api/v1"
            headers = {"Authorization": f"Bearer {self.merchantguy_api_key}"}
            
            if action == 'transactions':
                response = requests.get(f"{base_url}/transactions", headers=headers, params=params or {})
            elif action == 'reports':
                response = requests.get(f"{base_url}/reports", headers=headers, params=params or {})
            elif action == 'analytics':
                response = requests.get(f"{base_url}/analytics", headers=headers, params=params or {})
            else:
                return {"error": f"Unsupported MerchantGuy action: {action}"}
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"error": f"MerchantGuy API error: {response.status_code} - {response.text}"}
                
        except Exception as e:
            return {"error": f"MerchantGuy integration error: {str(e)}"}
    
    # Google Analytics Integration
    def get_google_analytics_data(self, action: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get data from Google Analytics API"""
        api_key = self.api_keys.get('google_analytics_api_key')
        if not api_key:
            return {"error": "Google Analytics API key not configured"}
        
        # Placeholder for Google Analytics integration
        return {"success": True, "data": {"message": "Google Analytics integration placeholder", "action": action}}
    
    # Google Ads Integration
    def get_google_ads_data(self, action: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get data from Google Ads API"""
        api_key = self.api_keys.get('google_ads_api_key')
        if not api_key:
            return {"error": "Google Ads API key not configured"}
        
        # Placeholder for Google Ads integration
        return {"success": True, "data": {"message": "Google Ads integration placeholder", "action": action}}
    
    # Facebook Integration
    def get_facebook_data(self, action: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get data from Facebook API"""
        api_key = self.api_keys.get('facebook_api_key')
        if not api_key:
            return {"error": "Facebook API key not configured"}
        
        # Placeholder for Facebook integration
        return {"success": True, "data": {"message": "Facebook integration placeholder", "action": action}}
    
    # TikTok Integration
    def get_tiktok_data(self, action: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get data from TikTok API"""
        api_key = self.api_keys.get('tiktok_api_key')
        if not api_key:
            return {"error": "TikTok API key not configured"}
        
        # Placeholder for TikTok integration
        return {"success": True, "data": {"message": "TikTok integration placeholder", "action": action}}
    
    # Twitter/X Integration
    def get_twitter_data(self, action: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get data from Twitter/X API"""
        api_key = self.api_keys.get('twitter_api_key')
        if not api_key:
            return {"error": "Twitter API key not configured"}
        
        # Placeholder for Twitter integration
        return {"success": True, "data": {"message": "Twitter integration placeholder", "action": action}}
    
    # YouTube Integration
    def get_youtube_data(self, action: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get data from YouTube API"""
        api_key = self.api_keys.get('youtube_api_key')
        if not api_key:
            return {"error": "YouTube API key not configured"}
        
        # Placeholder for YouTube integration
        return {"success": True, "data": {"message": "YouTube integration placeholder", "action": action}}
    
    # Validation methods (placeholders)
    def _validate_google_analytics(self, api_key: str) -> bool:
        # Placeholder validation
        return len(api_key) > 10
    
    def _validate_google_ads(self, api_key: str) -> bool:
        # Placeholder validation
        return len(api_key) > 10
    
    def _validate_facebook(self, api_key: str) -> bool:
        # Placeholder validation
        return len(api_key) > 10
    
    def _validate_tiktok(self, api_key: str) -> bool:
        # Placeholder validation
        return len(api_key) > 10
    
    def _validate_twitter(self, api_key: str) -> bool:
        # Placeholder validation
        return len(api_key) > 10
    
    def _validate_youtube(self, api_key: str) -> bool:
        # Placeholder validation
        return len(api_key) > 10
    
    def get_integration_status(self) -> Dict[str, Any]:
        """Get status of all integrations"""
        status = {
            "woocommerce": {
                "connected": bool(self.woo_consumer_key and self.woo_consumer_secret),
                "source": "environment"
            },
            "merchantguy": {
                "connected": bool(self.merchantguy_api_key),
                "source": "environment"
            }
        }
        
        # Check user-configured integrations
        platforms = ['google_analytics', 'google_ads', 'facebook', 'tiktok', 'twitter', 'youtube']
        for platform in platforms:
            api_key = self.api_keys.get(f"{platform}_api_key")
            status[platform] = {
                "connected": bool(api_key),
                "source": "user_config"
            }
        
        return status

# Global instance
api_service = APIIntegrationService()