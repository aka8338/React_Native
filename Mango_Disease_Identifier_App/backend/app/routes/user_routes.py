from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from bson.objectid import ObjectId

users = Blueprint("users", __name__)

@users.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Get user profile."""
    user_id = get_jwt_identity()
    
    user = User.get_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    return jsonify({
        "success": True,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "created_at": user.get("created_at"),
            "last_login": user.get("last_login")
        }
    }), 200

@users.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """Update user profile."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    user = User.get_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    name = data.get("name")
    
    User.update_profile(user_id, name=name)
    
    updated_user = User.get_user_by_id(user_id)
    
    return jsonify({
        "success": True,
        "message": "Profile updated successfully",
        "user": {
            "id": str(updated_user["_id"]),
            "email": updated_user["email"],
            "name": updated_user["name"]
        }
    }), 200

@users.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """Change user password."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get("current_password") or not data.get("new_password"):
        return jsonify({"success": False, "message": "Current password and new password are required"}), 400
    
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    user = User.get_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    # Verify current password
    if not User.check_password(user, current_password):
        return jsonify({"success": False, "message": "Current password is incorrect"}), 401
    
    # Update password
    User.change_password(user_id, new_password)
    
    return jsonify({
        "success": True,
        "message": "Password changed successfully"
    }), 200 