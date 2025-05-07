from app import create_app
import json
import os
from bson.objectid import ObjectId
from flask.json.provider import JSONProvider
import logging
from flask import jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = create_app()

# Custom JSON provider to handle ObjectId
class CustomJSONProvider(JSONProvider):
    def dumps(self, obj, **kwargs):
        return json.dumps(obj, cls=CustomJSONEncoder, **kwargs)
    
    def loads(self, s, **kwargs):
        return json.loads(s, **kwargs)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

# Set the JSON provider
app.json_provider_class = CustomJSONProvider
app.json = CustomJSONProvider(app)

# Connect to MongoDB directly
mongo_uri = os.getenv("MONGO_URI", "mongodb+srv://anwar:anwar2541@cluster0.azkmbl2.mongodb.net/authapp?retryWrites=true&w=majority&appName=Cluster0")
try:
    mongo_client = MongoClient(mongo_uri)
    db = mongo_client.get_database()
    logger.info(f"MongoDB client initialized with URI: {mongo_uri}")
except Exception as e:
    logger.error(f"Failed to initialize MongoDB client: {e}")
    db = None
    mongo_client = None

# Test MongoDB connection
def test_db_connection():
    if db is None or mongo_client is None:
        logger.error("Database not initialized")
        return False
    
    try:
        # The serverStatus command is cheap and does not require auth
        info = mongo_client.server_info()
        logger.info(f"MongoDB connection successful! Version: {info.get('version')}")
        return True
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        return False

# Add a database status endpoint
@app.route('/api/db-status', methods=['GET'])
def db_status():
    is_connected = test_db_connection()
    collections = []
    db_name = None
    
    if is_connected and db is not None:
        try:
            # List all collections in the database
            collections = db.list_collection_names()
            db_name = db.name
            logger.info(f"Found collections: {collections}")
        except Exception as e:
            logger.error(f"Failed to list collections: {e}")
        
    return jsonify({
        'status': 'connected' if is_connected else 'disconnected',
        'database_name': db_name,
        'collections': collections,
        'uri': mongo_uri.replace(os.getenv('MONGO_URI', '').split('@')[0], '***:***@')  # Hide credentials
    })

if __name__ == "__main__":
    # Test database connection before starting the app
    is_connected = test_db_connection()
    if is_connected and db is not None:
        logger.info(f"Connected to database: {db.name}")
    
    app.run(host="0.0.0.0", port=5000, debug=True)