"""
Machine Learning classifier module for Dicoding Capstone project
"""

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
import joblib
import numpy as np


class ModelClassifier:
    """
    Wrapper class for machine learning classification models
    """
    
    def __init__(self, model_type='random_forest'):
        """
        Initialize the classifier
        
        Args:
            model_type (str): Type of model to use ('random_forest' or 'logistic_regression')
        """
        self.model_type = model_type
        self.model = self._initialize_model(model_type)
        self.is_trained = False
        
    def _initialize_model(self, model_type):
        """
        Initialize the specified model type
        
        Args:
            model_type (str): Type of model to initialize
            
        Returns:
            Initialized model object
        """
        if model_type == 'random_forest':
            return RandomForestClassifier(n_estimators=100, random_state=42)
        elif model_type == 'logistic_regression':
            return LogisticRegression(random_state=42, max_iter=1000)
        else:
            raise ValueError(f"Unknown model type: {model_type}")
    
    def train(self, X_train, y_train):
        """
        Train the model
        
        Args:
            X_train: Training features
            y_train: Training labels
        """
        print(f"Training {self.model_type} model...")
        self.model.fit(X_train, y_train)
        self.is_trained = True
        print("Training completed!")
        
    def predict(self, X):
        """
        Make predictions using the trained model
        
        Args:
            X: Features to predict
            
        Returns:
            np.array: Predictions
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        return self.model.predict(X)
    
    def predict_proba(self, X):
        """
        Get prediction probabilities
        
        Args:
            X: Features to predict
            
        Returns:
            np.array: Prediction probabilities
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        return self.model.predict_proba(X)
    
    def evaluate(self, X_test, y_test):
        """
        Evaluate the model on test data
        
        Args:
            X_test: Test features
            y_test: True test labels
            
        Returns:
            dict: Evaluation metrics
        """
        predictions = self.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        report = classification_report(y_test, predictions)
        conf_matrix = confusion_matrix(y_test, predictions)
        
        print(f"\nModel Evaluation Results:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"\nClassification Report:\n{report}")
        print(f"\nConfusion Matrix:\n{conf_matrix}")
        
        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': conf_matrix
        }
    
    def save_model(self, filepath):
        """
        Save the trained model to disk
        
        Args:
            filepath (str): Path to save the model
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        joblib.dump(self.model, filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """
        Load a trained model from disk
        
        Args:
            filepath (str): Path to the saved model
        """
        self.model = joblib.load(filepath)
        self.is_trained = True
        print(f"Model loaded from {filepath}")
