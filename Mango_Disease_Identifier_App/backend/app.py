#!/usr/bin/env python
# Set environment variables before any imports
import os
import warnings
import logging
import sys

# Create a null device to redirect stderr
class NullDevice:
    def write(self, s):
        pass
    def flush(self):
        pass

# Save original stderr for later restoration if needed
original_stderr = sys.stderr

# Completely silence TensorFlow warnings and logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # 0=DEBUG, 1=INFO, 2=WARNING, 3=ERROR
os.environ['PYTHONWARNINGS'] = 'ignore::DeprecationWarning:tensorflow:'
os.environ['PYTHONWARNINGS'] = 'ignore::FutureWarning:tensorflow:'

# Suppress all warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import the rest of the modules
from app import create_app
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image
import numpy as np
import tensorflow as tf
import json
from bson.objectid import ObjectId
from flask.json.provider import JSONProvider
from flask import jsonify, request
from pymongo import MongoClient
from dotenv import load_dotenv
import datetime

# Use compat.v1 versions to avoid deprecation warnings
from tensorflow.compat.v1.losses import sparse_softmax_cross_entropy
from tensorflow.compat.v1 import executing_eagerly_outside_functions
from tensorflow.compat.v1.nn import fused_batch_norm

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
        # Handle datetime objects
        if isinstance(o, (datetime.datetime, datetime.date)):
            return o.isoformat()
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

# Get the project root directory
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
print("Project Root:", PROJECT_ROOT)

# Define categories directly instead of loading from filesystem
# IMPORTANT: Order must match the original training data order exactly
categories = ['Anthracnose', 'Die Back', 'Healthy', 'Powdery Mildew', 'Sooty Mould']
print("Categories:", categories)

# Define disease information dictionary with symptoms and recommendations
disease_info = {
    'anthracnose': {
        'name': 'Anthracnose',
        'symptoms': [
            'Small, dark, sunken spots on leaves, stems, flowers, and fruits',
            'Leaf spots that enlarge and coalesce',
            'Fruit spots that develop into sunken lesions',
            'Brown to black lesions with pink, salmon, or orange spore masses in humid conditions'
        ],
        'recommendations': [
            'Remove and destroy infected plant parts',
            'Apply fungicides as preventative treatment',
            'Improve air circulation by proper spacing and pruning',
            'Avoid overhead irrigation to reduce leaf wetness'
        ],
        'probability': 0.0  # Will be updated during prediction
    },
    'bacterial_canker': {
        'name': 'Bacterial Canker',
        'symptoms': [
            'Water-soaked lesions on leaves and stems',
            'Cankers on stems and branches',
            'Bacterial ooze from cankers',
            'Leaf spots with yellow halos'
        ],
        'recommendations': [
            'Prune and destroy infected branches',
            'Disinfect pruning tools after each cut',
            'Apply copper-based bactericides',
            'Maintain proper plant spacing for air circulation'
        ],
        'probability': 0.0
    },
    'die_back': {
        'name': 'Die Back',
        'symptoms': [
            'Progressive death of shoots, branches, and twigs',
            'Browning of leaves that remain attached',
            'Internal wood discoloration',
            'Cankers on stems and branches'
        ],
        'recommendations': [
            'Prune infected parts several inches below visible symptoms',
            'Apply fungicides during dormant season',
            'Maintain tree vigor with proper fertilization',
            'Avoid stress conditions like drought'
        ],
        'probability': 0.0
    },
    'healthy': {
        'name': 'Healthy',
        'symptoms': [
            'Vibrant green leaves without spots or discoloration',
            'Even leaf growth and development',
            'No visible lesions or abnormalities',
            'Healthy fruit development'
        ],
        'recommendations': [
            'Continue regular fertilization and watering practices',
            'Monitor for early signs of disease',
            'Maintain good air circulation',
            'Apply preventative treatments during high-risk seasons'
        ],
        'probability': 0.0
    },
    'powdery_mildew': {
        'name': 'Powdery Mildew',
        'symptoms': [
            'White or grayish powdery coating on leaves and fruits',
            'Stunted or distorted new growth',
            'Premature leaf drop',
            'Reduced fruit size and quality'
        ],
        'recommendations': [
            'Apply sulfur or potassium bicarbonate-based fungicides',
            'Improve air circulation by proper spacing and pruning',
            'Remove and destroy infected leaves',
            'Apply preventative treatments during susceptible periods'
        ],
        'probability': 0.0
    },
    'sooty_mould': {
        'name': 'Sooty Mold',
        'symptoms': [
            'Black, sooty or powdery coating on leaves and stems',
            'Sticky honeydew on plant surfaces',
            'Presence of insects like aphids, scale, or whiteflies',
            'Reduced plant vigor due to decreased photosynthesis'
        ],
        'recommendations': [
            'Control sap-sucking insects that produce honeydew',
            'Wash affected leaves with mild soap solution',
            'Apply insecticidal soap or horticultural oil',
            'Maintain proper plant nutrition and watering'
        ],
        'probability': 0.0
    }
}

# Load the saved model with normalized path
model_path = os.path.join(PROJECT_ROOT, 'backend', 'model', 'mango_disease_classifier.keras')

try:
    model = tf.keras.models.load_model(model_path)
    print("Model loaded successfully from:", model_path)
    
    # Verify model can make predictions with correct categories
    logger.info(f"Model loaded with {len(categories)} categories: {', '.join(categories)}")
except Exception as e:
    print(f"Error loading model from {model_path}: {e}")
    logger.error(f"Failed to load model: {e}")
    model = None

# Prediction route
@app.route('/predict', methods=['POST'])
def predict():
    if not categories:
        return jsonify({'error': 'Categories not available. Server is not properly configured.'}), 500
        
    if model is None:
        return jsonify({'error': 'Model not loaded. Server is not properly configured.'}), 500
        
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    if not file or not file.filename:
        return jsonify({'error': 'Empty file or invalid filename'}), 400
    
    try:
        img = Image.open(file.stream).convert('RGB').resize((320, 320))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        
        # Ensure the model can run inference
        pred = model.predict(x)
        
        if pred is not None and len(pred) > 0:
            class_index = np.argmax(pred, axis=1)[0]
            prediction_probability = float(pred[0][class_index])
            
            # Validate index is within categories range
            if class_index < 0 or class_index >= len(categories):
                logger.error(f"Invalid class index: {class_index}. Out of range for categories.")
                return jsonify({'error': 'Model prediction out of range'}), 500
                
            predicted_class = categories[class_index]
            
            # Get corresponding disease information
            result = {}
            if predicted_class.lower() in disease_info:
                result = disease_info[predicted_class.lower()]
                # Update the probability with the actual prediction
                result['probability'] = prediction_probability
            else:
                # Generic response if the disease is not in our database
                result = {
                    'name': predicted_class,
                    'symptoms': ['Please consult a plant pathologist for detailed symptoms'],
                    'recommendations': ['Consult with a plant pathologist for proper treatment'],
                    'probability': prediction_probability
                }
            
            # Add the class name for backward compatibility
            result['prediction'] = predicted_class
            result['class'] = predicted_class
            result['disease'] = predicted_class
            result['disease_name'] = result['name']
            
            # Log the prediction for monitoring
            logger.info(f"Predicted disease: {predicted_class} with confidence: {prediction_probability:.4f}")
            
            return jsonify(result)
        else:
            logger.error("Model returned empty prediction")
            return jsonify({'error': 'Model returned empty prediction'}), 500
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500



if __name__ == "__main__":
    # Test database connection before starting the app
    is_connected = test_db_connection()
    if is_connected and db is not None:
        logger.info(f"Connected to database: {db.name}")
    
    # Use a more stable server configuration to prevent socket errors and unwanted restarts
    from werkzeug.serving import run_simple
    
    print("\n" + "="*50)
    print("SERVER STARTING - SINGLE INSTANCE MODE")
    print("="*50)
    print("\nMango Disease Identifier API is running!")
    print("\nAvailable endpoints:")
    print(f"  - POST http://127.0.0.1:5000/predict (upload an image)")
    print(f"  - GET  http://127.0.0.1:5000/api/db-status (check database)")
    print("\nAlso available on your network at:")
    import socket
    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print(f"  - http://{local_ip}:5000/")
    except:
        pass
    print("\nPress CTRL+C once to stop the server")
    print("="*50 + "\n")
    
    # Run with simple server, no auto-reloading
    run_simple('0.0.0.0', 5000, app, use_reloader=False, use_debugger=False, threaded=False)