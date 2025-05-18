import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_client = None
db = None

def get_db():
    """Get the database connection."""
    global mongo_client, db
    if db is None:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/mango_disease_db")
        mongo_client = MongoClient(mongo_uri)
        db = mongo_client.get_database()
    return db 