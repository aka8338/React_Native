import datetime
import bcrypt
from bson import ObjectId
from app import db

class User:
    """User model for MongoDB."""
    
    COLLECTION = db.users
    
    @staticmethod
    def create_user(email, password, name=None):
        """Create a new user."""
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user = {
            "email": email,
            "password": hashed_password,
            "name": name or email.split("@")[0],  # Default name is part of email
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
            "is_active": False,  # User is inactive until email verification
            "last_login": None
        }
        
        result = User.COLLECTION.insert_one(user)
        user["_id"] = result.inserted_id
        return user
    
    @staticmethod
    def get_user_by_email(email):
        """Get a user by their email address."""
        return User.COLLECTION.find_one({"email": email})
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get a user by their ID."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return User.COLLECTION.find_one({"_id": user_id})
    
    @staticmethod
    def activate_user(user_id):
        """Activate a user's account."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        User.COLLECTION.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "is_active": True,
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        )
    
    @staticmethod
    def update_last_login(user_id):
        """Update the last login timestamp."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        User.COLLECTION.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "last_login": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        )
    
    @staticmethod
    def update_profile(user_id, name=None, email=None):
        """Update user profile information."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        update_data = {"updated_at": datetime.datetime.utcnow()}
        
        if name:
            update_data["name"] = name
        
        if email:
            update_data["email"] = email
        
        User.COLLECTION.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
    
    @staticmethod
    def check_password(user, password):
        """Check if the password is correct."""
        if not user or "password" not in user:
            return False
        
        return bcrypt.checkpw(password.encode('utf-8'), user["password"])
    
    @staticmethod
    def change_password(user_id, new_password):
        """Change a user's password."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        User.COLLECTION.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "password": hashed_password,
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        ) 