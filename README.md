# Dicoding Capstone Use Case 4

Repository untuk proyek Dicoding Asah Capstone Use Case 4 - Machine Learning Application

## Deskripsi Proyek

Proyek ini merupakan implementasi aplikasi Machine Learning yang dirancang untuk menyelesaikan Use Case 4 dari program Dicoding Capstone. Aplikasi ini menyediakan struktur lengkap untuk pengembangan model pembelajaran mesin, termasuk preprocessing data, pelatihan model, dan evaluasi.

## Struktur Proyek

```
DicodingCapstone/
├── data/
│   ├── raw/           # Data mentah
│   └── processed/     # Data yang sudah diproses
├── notebooks/         # Jupyter notebooks untuk eksplorasi
├── src/
│   ├── data/         # Modul untuk preprocessing data
│   │   ├── __init__.py
│   │   └── preprocessor.py
│   ├── models/       # Modul untuk model ML
│   │   ├── __init__.py
│   │   └── classifier.py
│   └── utils/        # Utility functions
│       ├── __init__.py
│       └── helpers.py
├── tests/            # Unit tests
├── main.py          # File utama aplikasi
├── requirements.txt # Dependencies
└── README.md        # Dokumentasi
```

## Fitur

- **Data Preprocessing**: Modul lengkap untuk preprocessing data termasuk handling missing values, feature scaling, dan encoding
- **Model Training**: Support untuk berbagai model ML (Random Forest, Logistic Regression)
- **Model Evaluation**: Evaluasi model dengan berbagai metrik (accuracy, classification report, confusion matrix)
- **Model Persistence**: Save dan load model yang sudah dilatih
- **Utility Functions**: Helper functions untuk visualisasi dan analisis data

## Instalasi

1. Clone repository ini:
```bash
git clone https://github.com/danielwinstonmandela/DicodingCapstone.git
cd DicodingCapstone
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Penggunaan

### Menjalankan Aplikasi

```bash
python main.py
```

### Menggunakan Modul Data Preprocessing

```python
from src.data.preprocessor import DataPreprocessor

preprocessor = DataPreprocessor()
data = preprocessor.load_data('data/raw/your_dataset.csv')
data = preprocessor.handle_missing_values(data)
data = preprocessor.scale_features(data)
```

### Melatih Model

```python
from src.models.classifier import ModelClassifier
from sklearn.model_selection import train_test_split

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Initialize dan train model
model = ModelClassifier(model_type='random_forest')
model.train(X_train, y_train)

# Evaluasi
results = model.evaluate(X_test, y_test)

# Save model
model.save_model('models/trained_model.pkl')
```

## Dependencies

- numpy >= 1.21.0
- pandas >= 1.3.0
- scikit-learn >= 1.0.1
- matplotlib >= 3.4.0
- seaborn >= 0.11.0
- jupyter >= 1.0.0
- flask >= 2.3.3
- tensorflow >= 2.13.0

## Kontribusi

Silakan buat pull request untuk kontribusi atau laporkan issues jika menemukan bug.

## Lisensi

MIT License

## Kontak

- Author: Daniel Winston Mandela
- Repository: [DicodingCapstone](https://github.com/danielwinstonmandela/DicodingCapstone)

## Catatan

Proyek ini adalah template untuk Dicoding Capstone Use Case 4. Anda perlu:
1. Menambahkan dataset Anda ke folder `data/raw/`
2. Menyesuaikan preprocessing sesuai kebutuhan data
3. Mengkonfigurasi dan melatih model sesuai task Anda
4. Menambahkan unit tests
5. Mengimplementasikan API endpoint jika diperlukan
