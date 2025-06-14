import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
from mongoengine import connect

# Load environment variables
load_dotenv()

# Initialize Flask extensions
jwt = JWTManager()
mail = Mail()

def create_app():
    """Initialize the Flask application."""
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Configure app
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "default-jwt-secret-key")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "default-flask-secret-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 24 hours
    app.config['MONGODB_SETTINGS'] = {
        'db': 'mango_disease_db',
        'host': 'localhost',
        'port': 27017
    }
    
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
    
    # Connect to MongoDB using mongoengine
    connect('mango_disease_db', host='localhost', port=27017)
    
    # Import routes after app is created
    from app.routes.auth_routes import auth
    from app.routes.user_routes import users
    from app.routes.disease_reports import disease_reports
    
    # Register blueprints
    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(users, url_prefix='/api/users')
    app.register_blueprint(disease_reports, url_prefix='/api/disease-reports')
    
    # Note: The prediction endpoint is registered directly in app.py
    # This creates the Flask app that will host both the API endpoints and the ML model prediction route
    
    return app 