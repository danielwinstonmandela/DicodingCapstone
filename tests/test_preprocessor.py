"""
Unit tests for DataPreprocessor class
"""

import unittest
import pandas as pd
import numpy as np
from src.data.preprocessor import DataPreprocessor


class TestDataPreprocessor(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.preprocessor = DataPreprocessor()
        # Create sample data for testing
        self.sample_data = pd.DataFrame({
            'feature1': [1, 2, np.nan, 4, 5],
            'feature2': [10, 20, 30, 40, 50],
            'category': ['A', 'B', 'A', 'B', 'A'],
            'target': [0, 1, 0, 1, 0]
        })
    
    def test_handle_missing_values_drop(self):
        """Test dropping missing values"""
        result = self.preprocessor.handle_missing_values(self.sample_data, strategy='drop')
        self.assertEqual(len(result), 4)
        self.assertFalse(result.isnull().any().any())
    
    def test_handle_missing_values_mean(self):
        """Test filling missing values with mean"""
        result = self.preprocessor.handle_missing_values(self.sample_data, strategy='mean')
        self.assertEqual(len(result), 5)
        self.assertFalse(result['feature1'].isnull().any())
    
    def test_scale_features(self):
        """Test feature scaling"""
        data = self.sample_data.dropna()
        result = self.preprocessor.scale_features(data, columns=['feature1', 'feature2'])
        # Check if scaling was applied (mean should be close to 0)
        self.assertAlmostEqual(result['feature1'].mean(), 0, places=5)
        self.assertAlmostEqual(result['feature2'].mean(), 0, places=5)
    
    def test_split_features_target(self):
        """Test splitting features and target"""
        X, y = self.preprocessor.split_features_target(self.sample_data, 'target')
        self.assertEqual(X.shape[1], 3)  # 3 features (excluding target)
        self.assertEqual(len(y), 5)
        self.assertNotIn('target', X.columns)


if __name__ == '__main__':
    unittest.main()
