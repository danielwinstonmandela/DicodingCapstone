"""
Main application file for Dicoding Capstone Use Case 4
"""

import os
from src.data.preprocessor import DataPreprocessor
from src.models.classifier import ModelClassifier
from src.utils.helpers import create_directory, print_dataset_info
from sklearn.model_selection import train_test_split


def main():
    """
    Main function to run the machine learning pipeline
    """
    print("=" * 50)
    print("Dicoding Capstone Use Case 4")
    print("Machine Learning Application")
    print("=" * 50)
    
    # Initialize components
    preprocessor = DataPreprocessor()
    
    # Example usage - you would replace this with your actual data
    print("\nThis is a template for Dicoding Capstone Use Case 4")
    print("To use this application:")
    print("1. Place your dataset in the data/raw/ directory")
    print("2. Update the data loading and preprocessing steps")
    print("3. Configure your model parameters")
    print("4. Run training and evaluation")
    
    # Example workflow (commented out - replace with actual implementation)
    """
    # Load data
    data = preprocessor.load_data('data/raw/your_dataset.csv')
    
    # Preprocess data
    data = preprocessor.handle_missing_values(data)
    data = preprocessor.scale_features(data)
    
    # Split features and target
    X, y = preprocessor.split_features_target(data, 'target_column')
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Initialize and train model
    model = ModelClassifier(model_type='random_forest')
    model.train(X_train, y_train)
    
    # Evaluate model
    results = model.evaluate(X_test, y_test)
    
    # Save model
    create_directory('models')
    model.save_model('models/trained_model.pkl')
    """
    
    print("\n✓ Application setup complete!")
    print("✓ Project structure is ready for development")


if __name__ == "__main__":
    main()
