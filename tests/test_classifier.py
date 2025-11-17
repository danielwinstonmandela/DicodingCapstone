"""
Unit tests for ModelClassifier class
"""

import unittest
import numpy as np
from sklearn.datasets import make_classification
from src.models.classifier import ModelClassifier


class TestModelClassifier(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        # Generate synthetic data for testing
        self.X, self.y = make_classification(
            n_samples=100,
            n_features=10,
            n_classes=2,
            random_state=42
        )
        self.X_train = self.X[:80]
        self.y_train = self.y[:80]
        self.X_test = self.X[80:]
        self.y_test = self.y[80:]
    
    def test_initialize_random_forest(self):
        """Test Random Forest initialization"""
        model = ModelClassifier(model_type='random_forest')
        self.assertIsNotNone(model.model)
        self.assertEqual(model.model_type, 'random_forest')
        self.assertFalse(model.is_trained)
    
    def test_initialize_logistic_regression(self):
        """Test Logistic Regression initialization"""
        model = ModelClassifier(model_type='logistic_regression')
        self.assertIsNotNone(model.model)
        self.assertEqual(model.model_type, 'logistic_regression')
    
    def test_invalid_model_type(self):
        """Test initialization with invalid model type"""
        with self.assertRaises(ValueError):
            ModelClassifier(model_type='invalid_model')
    
    def test_train_model(self):
        """Test model training"""
        model = ModelClassifier(model_type='random_forest')
        model.train(self.X_train, self.y_train)
        self.assertTrue(model.is_trained)
    
    def test_predict_without_training(self):
        """Test prediction without training raises error"""
        model = ModelClassifier(model_type='random_forest')
        with self.assertRaises(ValueError):
            model.predict(self.X_test)
    
    def test_predict_after_training(self):
        """Test prediction after training"""
        model = ModelClassifier(model_type='random_forest')
        model.train(self.X_train, self.y_train)
        predictions = model.predict(self.X_test)
        self.assertEqual(len(predictions), len(self.X_test))
    
    def test_predict_proba(self):
        """Test probability predictions"""
        model = ModelClassifier(model_type='random_forest')
        model.train(self.X_train, self.y_train)
        probas = model.predict_proba(self.X_test)
        self.assertEqual(probas.shape[0], len(self.X_test))
        # Check probabilities sum to 1
        self.assertTrue(np.allclose(probas.sum(axis=1), 1.0))
    
    def test_evaluate(self):
        """Test model evaluation"""
        model = ModelClassifier(model_type='random_forest')
        model.train(self.X_train, self.y_train)
        results = model.evaluate(self.X_test, self.y_test)
        self.assertIn('accuracy', results)
        self.assertIn('classification_report', results)
        self.assertIn('confusion_matrix', results)
        self.assertGreater(results['accuracy'], 0)
        self.assertLessEqual(results['accuracy'], 1)


if __name__ == '__main__':
    unittest.main()
