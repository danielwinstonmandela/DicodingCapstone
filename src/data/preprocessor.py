"""
Data preprocessing module for the Dicoding Capstone project
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder


class DataPreprocessor:
    """
    Class for preprocessing data before model training
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}  # Dictionary to store encoders for each column
        
    def load_data(self, filepath):
        """
        Load data from a CSV file
        
        Args:
            filepath (str): Path to the CSV file
            
        Returns:
            pd.DataFrame: Loaded dataframe
        """
        try:
            data = pd.read_csv(filepath)
            print(f"Data loaded successfully. Shape: {data.shape}")
            return data
        except Exception as e:
            print(f"Error loading data: {e}")
            return None
    
    def handle_missing_values(self, data, strategy='mean'):
        """
        Handle missing values in the dataset
        
        Args:
            data (pd.DataFrame): Input dataframe
            strategy (str): Strategy for handling missing values ('mean', 'median', 'mode', 'drop')
            
        Returns:
            pd.DataFrame: Dataframe with handled missing values
        """
        if strategy == 'drop':
            return data.dropna()
        elif strategy == 'mean':
            # Only fill numeric columns with mean
            numeric_cols = data.select_dtypes(include=[np.number]).columns
            data_copy = data.copy()
            data_copy[numeric_cols] = data_copy[numeric_cols].fillna(data[numeric_cols].mean())
            return data_copy
        elif strategy == 'median':
            # Only fill numeric columns with median
            numeric_cols = data.select_dtypes(include=[np.number]).columns
            data_copy = data.copy()
            data_copy[numeric_cols] = data_copy[numeric_cols].fillna(data[numeric_cols].median())
            return data_copy
        elif strategy == 'mode':
            return data.fillna(data.mode().iloc[0])
        else:
            return data
    
    def scale_features(self, data, columns=None):
        """
        Scale numerical features using StandardScaler
        
        Args:
            data (pd.DataFrame): Input dataframe
            columns (list): List of columns to scale. If None, scale all numeric columns
            
        Returns:
            pd.DataFrame: Dataframe with scaled features
        """
        if columns is None:
            columns = data.select_dtypes(include=[np.number]).columns
        
        data_copy = data.copy()
        data_copy[columns] = self.scaler.fit_transform(data[columns])
        return data_copy
    
    def encode_categorical(self, data, columns):
        """
        Encode categorical variables
        
        Args:
            data (pd.DataFrame): Input dataframe
            columns (list): List of categorical columns to encode
            
        Returns:
            pd.DataFrame: Dataframe with encoded categorical variables
        """
        data_copy = data.copy()
        for col in columns:
            if col in data_copy.columns:
                # Create a new encoder for each column
                self.label_encoders[col] = LabelEncoder()
                data_copy[col] = self.label_encoders[col].fit_transform(data_copy[col])
        return data_copy
    
    def split_features_target(self, data, target_column):
        """
        Split data into features and target
        
        Args:
            data (pd.DataFrame): Input dataframe
            target_column (str): Name of the target column
            
        Returns:
            tuple: (X, y) features and target
        """
        X = data.drop(columns=[target_column])
        y = data[target_column]
        return X, y
