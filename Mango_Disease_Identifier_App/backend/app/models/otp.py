import datetime
import random
import os
from app.utils.db import get_db

class OTP:
    """OTP model for email verification."""
    
    @staticmethod
    def get_collection():
        return get_db().otps
    
    @staticmethod
    def generate_otp(length=6):
        """Generate a random OTP."""
        digits = "0123456789"
        otp = ""
        for _ in range(length):
            otp += random.choice(digits)
        return otp
    
    @staticmethod
    def create_otp(email, purpose="verification"):
        """Create a new OTP for a user."""
        # Delete any existing OTPs for this email and purpose
        OTP.get_collection().delete_many({"email": email, "purpose": purpose})
        
        # Generate new OTP
        otp_code = OTP.generate_otp()
        expiry_minutes = int(os.getenv("OTP_EXPIRY_MINUTES", 10))
        
        otp_data = {
            "email": email,
            "code": otp_code,
            "purpose": purpose,
            "created_at": datetime.datetime.utcnow(),
            "expires_at": datetime.datetime.utcnow() + datetime.timedelta(minutes=expiry_minutes),
            "is_used": False
        }
        
        OTP.get_collection().insert_one(otp_data)
        return otp_code
    
    @staticmethod
    def verify_otp(email, otp_code, purpose="verification"):
        """Verify an OTP."""
        otp_data = OTP.get_collection().find_one({
            "email": email,
            "code": otp_code,
            "purpose": purpose,
            "is_used": False,
            "expires_at": {"$gt": datetime.datetime.utcnow()}
        })
        
        if not otp_data:
            return False
        
        # Mark OTP as used
        OTP.get_collection().update_one(
            {"_id": otp_data["_id"]},
            {"$set": {"is_used": True}}
        )
        
        return True
    
    @staticmethod
    def cleanup_expired_otps():
        """Clean up expired OTPs."""
        OTP.get_collection().delete_many({
            "$or": [
                {"expires_at": {"$lt": datetime.datetime.utcnow()}},
                {"is_used": True}
            ]
        }) 