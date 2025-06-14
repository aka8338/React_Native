from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app.models.otp import OTP
from app.services.email_service import EmailService
from email_validator import validate_email, EmailNotValidError
import json
from bson.objectid import ObjectId

# Custom JSON encoder to handle ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

auth = Blueprint("auth", __name__)

@auth.route("/signup", methods=["POST"])
def signup():
    """Register a new user."""
    data = request.get_json()
    
    # Validate input
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"success": False, "message": "Email and password are required"}), 400
    
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    
    # Validate email
    try:
        valid = validate_email(email)
        email = valid.email
    except EmailNotValidError:
        return jsonify({"success": False, "message": "Invalid email address"}), 400
    
    # Check if user already exists
    existing_user = User.get_user_by_email(email)
    if existing_user:
        return jsonify({"success": False, "message": "Email already registered"}), 409
    
    # Create user
    user = User.create_user(email, password, name)
    
    # Generate and send OTP
    otp_code = OTP.create_otp(email)
    try:
        EmailService.send_otp_email(email, otp_code)
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to send verification email: {str(e)}"}), 500
    
    return jsonify({
        "success": True,
        "message": "Registration successful. Verification code sent to your email.",
        "user_id": str(user["_id"])
    }), 201

@auth.route("/verify-otp", methods=["POST"])
def verify_otp():
    """Verify OTP for email verification."""
    data = request.get_json()
    
    if not data or not data.get("email") or not data.get("otp"):
        return jsonify({"success": False, "message": "Email and OTP are required"}), 400
    
    email = data.get("email")
    otp_code = data.get("otp")
    
    # Get user
    user = User.get_user_by_email(email)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    # Verify OTP
    if not OTP.verify_otp(email, otp_code):
        return jsonify({"success": False, "message": "Invalid or expired OTP"}), 400
    
    # Activate user
    User.activate_user(user["_id"])
    
    # Generate JWT token
    access_token = create_access_token(identity=str(user["_id"]))
    
    return jsonify({
        "success": True,
        "message": "Email verified successfully",
        "token": access_token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"]
        }
    }), 200

@auth.route("/login", methods=["POST"])
def login():
    """Login a user."""
    data = request.get_json()
    
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"success": False, "message": "Email and password are required"}), 400
    
    email = data.get("email")
    password = data.get("password")
    
    # Get user
    user = User.get_user_by_email(email)
    if not user:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401
    
    # Check password
    if not User.check_password(user, password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401
    
    # Check if user is active
    if not user.get("is_active", False):
        # Generate and send new OTP
        otp_code = OTP.create_otp(email)
        try:
            EmailService.send_otp_email(email, otp_code)
        except Exception as e:
            return jsonify({"success": False, "message": f"Failed to send verification email: {str(e)}"}), 500
        
        return jsonify({
            "success": False,
            "message": "Account not verified. New verification code sent to your email.",
            "requires_verification": True
        }), 403
    
    # Update last login
    User.update_last_login(user["_id"])
    
    # Generate JWT token
    access_token = create_access_token(identity=str(user["_id"]))
    
    return jsonify({
        "success": True,
        "message": "Login successful",
        "token": access_token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"]
        }
    }), 200

@auth.route("/resend-otp", methods=["POST"])
def resend_otp():
    """Resend OTP for email verification."""
    data = request.get_json()
    
    if not data or not data.get("email"):
        return jsonify({"success": False, "message": "Email is required"}), 400
    
    email = data.get("email")
    
    # Get user
    user = User.get_user_by_email(email)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    # Generate and send OTP
    otp_code = OTP.create_otp(email)
    try:
        EmailService.send_otp_email(email, otp_code)
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to send verification email: {str(e)}"}), 500
    
    return jsonify({
        "success": True,
        "message": "Verification code sent to your email"
    }), 200

@auth.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Send password reset OTP."""
    data = request.get_json()
    
    if not data or not data.get("email"):
        return jsonify({"success": False, "message": "Email is required"}), 400
    
    email = data.get("email")
    
    # Get user
    user = User.get_user_by_email(email)
    if not user:
        # For security reasons, don't reveal if email exists or not
        return jsonify({
            "success": True,
            "message": "If your email is registered, you will receive a password reset code"
        }), 200
    
    # Generate and send OTP
    otp_code = OTP.create_otp(email, purpose="password_reset")
    try:
        EmailService.send_otp_email(email, otp_code)
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to send reset email: {str(e)}"}), 500
    
    return jsonify({
        "success": True,
        "message": "If your email is registered, you will receive a password reset code"
    }), 200

@auth.route("/reset-password", methods=["POST"])
def reset_password():
    """Reset password with OTP."""
    data = request.get_json()
    
    if not data or not data.get("email") or not data.get("otp") or not data.get("new_password"):
        return jsonify({"success": False, "message": "Email, OTP, and new password are required"}), 400
    
    email = data.get("email")
    otp_code = data.get("otp")
    new_password = data.get("new_password")
    
    # Get user
    user = User.get_user_by_email(email)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    # Verify OTP
    if not OTP.verify_otp(email, otp_code, purpose="password_reset"):
        return jsonify({"success": False, "message": "Invalid or expired OTP"}), 400
    
    # Update password
    User.change_password(user["_id"], new_password)
    
    return jsonify({
        "success": True,
        "message": "Password reset successful"
    }), 200

@auth.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get current user profile."""
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
            "is_active": user.get("is_active", False),
            "created_at": user.get("created_at")
        }
    }), 200 