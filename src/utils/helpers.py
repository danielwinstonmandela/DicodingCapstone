"""
Helper utility functions for the Dicoding Capstone project
"""

import os
import json
import matplotlib.pyplot as plt
import seaborn as sns


def create_directory(directory_path):
    """
    Create a directory if it doesn't exist
    
    Args:
        directory_path (str): Path to the directory
    """
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)
        print(f"Directory created: {directory_path}")
    else:
        print(f"Directory already exists: {directory_path}")


def save_config(config_dict, filepath):
    """
    Save configuration dictionary to a JSON file
    
    Args:
        config_dict (dict): Configuration dictionary
        filepath (str): Path to save the JSON file
    """
    try:
        with open(filepath, 'w') as f:
            json.dump(config_dict, f, indent=4)
        print(f"Configuration saved to {filepath}")
    except IOError as e:
        print(f"Error saving configuration to {filepath}: {e}")
        raise
    except Exception as e:
        print(f"Unexpected error saving configuration: {e}")
        raise


def load_config(filepath):
    """
    Load configuration from a JSON file
    
    Args:
        filepath (str): Path to the JSON file
        
    Returns:
        dict: Configuration dictionary
    """
    try:
        with open(filepath, 'r') as f:
            config = json.load(f)
        print(f"Configuration loaded from {filepath}")
        return config
    except FileNotFoundError:
        print(f"Configuration file not found: {filepath}")
        raise
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from {filepath}: {e}")
        raise
    except Exception as e:
        print(f"Unexpected error loading configuration: {e}")
        raise


def plot_confusion_matrix(confusion_matrix, class_names=None, title='Confusion Matrix'):
    """
    Plot a confusion matrix
    
    Args:
        confusion_matrix (array): Confusion matrix to plot
        class_names (list): Names of the classes
        title (str): Title for the plot
    """
    plt.figure(figsize=(8, 6))
    sns.heatmap(confusion_matrix, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names)
    plt.title(title)
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.show()


def plot_feature_importance(model, feature_names, top_n=10):
    """
    Plot feature importance from a trained model
    
    Args:
        model: Trained model with feature_importances_ attribute
        feature_names (list): Names of features
        top_n (int): Number of top features to display
    """
    if not hasattr(model, 'feature_importances_'):
        print("Model does not have feature_importances_ attribute")
        return
    
    importances = model.feature_importances_
    indices = importances.argsort()[-top_n:][::-1]
    
    plt.figure(figsize=(10, 6))
    plt.title(f'Top {top_n} Feature Importances')
    plt.bar(range(top_n), importances[indices])
    plt.xticks(range(top_n), [feature_names[i] for i in indices], rotation=45, ha='right')
    plt.xlabel('Feature')
    plt.ylabel('Importance')
    plt.tight_layout()
    plt.show()


def print_dataset_info(data):
    """
    Print basic information about a dataset
    
    Args:
        data (pd.DataFrame): Dataset to analyze
    """
    print("Dataset Information:")
    print(f"Shape: {data.shape}")
    print(f"\nColumn Types:\n{data.dtypes}")
    print(f"\nMissing Values:\n{data.isnull().sum()}")
    print(f"\nBasic Statistics:\n{data.describe()}")
