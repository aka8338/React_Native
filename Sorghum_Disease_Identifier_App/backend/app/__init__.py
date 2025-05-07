import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

# Initialize Flask extensions
jwt = JWTManager()
mail = Mail()

# MongoDB connection
mongo_client = None
db = None

def create_app():
    """Initialize the Flask application."""
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Configure app
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "default-jwt-secret-key")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "default-flask-secret-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 24 hours
    
    # Configure email
    app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
    app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
    app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")
    
    # Initialize extensions
    jwt.init_app(app)
    mail.init_app(app)
    
    # Initialize MongoDB connection
    global mongo_client, db
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/sorghum_disease_app")
    mongo_client = MongoClient(mongo_uri)
    db = mongo_client.get_database()
    
    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    
    return app 