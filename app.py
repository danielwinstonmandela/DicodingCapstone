"""
Flask API for Dicoding Capstone Use Case 4
"""

from flask import Flask, request, jsonify
import numpy as np
import joblib
import os

app = Flask(__name__)

# Global variable to store loaded model
model = None


def load_model():
    """Load the trained model"""
    global model
    model_path = 'models/trained_model.pkl'
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print(f"Model loaded from {model_path}")
    else:
        print("No trained model found. Please train a model first.")


@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Welcome to Dicoding Capstone Use Case 4 API',
        'version': '1.0.0',
        'endpoints': {
            '/': 'Home page',
            '/health': 'Health check',
            '/predict': 'Make predictions (POST)',
            '/model/info': 'Get model information'
        }
    })


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Make predictions using the loaded model
    
    Expected JSON format:
    {
        "features": [[1, 2, 3, 4, 5]]
    }
    """
    if model is None:
        return jsonify({
            'error': 'Model not loaded. Please train and load a model first.'
        }), 400
    
    try:
        data = request.get_json()
        
        if 'features' not in data:
            return jsonify({
                'error': 'Missing "features" field in request'
            }), 400
        
        features = np.array(data['features'])
        predictions = model.predict(features)
        
        # If model supports probability predictions
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(features)
            return jsonify({
                'predictions': predictions.tolist(),
                'probabilities': probabilities.tolist()
            })
        else:
            return jsonify({
                'predictions': predictions.tolist()
            })
    
    except Exception as e:
        # Log the actual error for debugging (in production, use proper logging)
        print(f"Prediction error: {e}")
        # Return generic error message to avoid exposing implementation details
        return jsonify({
            'error': 'An error occurred while processing the prediction request'
        }), 500


@app.route('/model/info')
def model_info():
    """Get information about the loaded model"""
    if model is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 400
    
    info = {
        'model_type': type(model).__name__,
        'model_loaded': True
    }
    
    # Add additional info if available
    if hasattr(model, 'n_features_in_'):
        info['n_features'] = int(model.n_features_in_)
    
    if hasattr(model, 'classes_'):
        info['classes'] = model.classes_.tolist()
    
    return jsonify(info)


if __name__ == '__main__':
    # Try to load model on startup
    load_model()
    
    # Run the Flask app
    # Use environment variables for production settings
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_PORT', '5000'))
    
    app.run(debug=debug_mode, host=host, port=port)
