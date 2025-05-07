from flask import jsonify
from bson.objectid import ObjectId
import json
import datetime

class ApiResponse:
    """Helper class for API responses."""
    
    @staticmethod
    def success(data=None, message=None, status_code=200):
        """Return a success response."""
        response = {
            "success": True
        }
        
        if message:
            response["message"] = message
            
        if data:
            response["data"] = data
            
        return jsonify(response), status_code
    
    @staticmethod
    def error(message, status_code=400):
        """Return an error response."""
        return jsonify({
            "success": False,
            "message": message
        }), status_code

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for MongoDB objects."""
    
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

def format_user_response(user):
    """Format a user object for API response."""
    if not user:
        return None
        
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "is_active": user.get("is_active", False),
        "created_at": user.get("created_at"),
        "last_login": user.get("last_login")
    } 