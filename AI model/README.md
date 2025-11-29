# 🧪 Asah - Molecule Properties Prediction Agent

AI-powered molecule discovery system that generates and evaluates novel molecular candidates based on QM9 property constraints using a hybrid generative-search approach.

---

## 🎯 Overview

This project combines multiple state-of-the-art AI models to discover molecules that satisfy specific quantum mechanical properties. It uses:
- **Generative AI** to create novel molecule candidates
- **Vector search** to find similar molecules from existing databases
- **Property prediction** to estimate QM9 properties
- **LLM-based evaluation** to rank and explain candidates

---

## 🏗️ Architecture

### Core Components

1. **`agent.py`** - Main pipeline orchestration using LangGraph
   - Multi-step state machine for molecule discovery
   - Iterative optimization loop with LLM feedback
   - Combines generative and search-based approaches

2. **`app.py`** - Gradio web interface and REST API
   - Interactive UI for constraint input
   - API endpoints for programmatic access
   - Health check and monitoring

### Pipeline Flow

```
Input Constraints → Parse → Encode → Vector Search
                              ↓
                         Generate (MolT5)
                              ↓
                         Filter (RDKit)
                              ↓
                      Predict (ChemBERTa)
                              ↓
                       Evaluate (LLM)
                              ↓
                   ┌─── Optimize? ───┐
                  Yes                No
                   │                  │
              (iterate)            Rank
                                     ↓
                              Combine Results
                                     ↓
                              LLM Explanation
                                     ↓
                               Final Output
```

---

## 🤖 Models Used

| Model | Purpose | Source |
|-------|---------|--------|
| **MolT5** | Molecule generation from properties | `Dahyunn/molT5-finetuned` |
| **ChemBERTa** | QM9 property prediction | `Dahyunn/chemberta-qm9` |
| **T5 Encoder** | Embedding generation for vector search | `Dahyunn/molT5-finetuned` |
| **Grok-4.1-fast** | Evaluation and explanation | OpenRouter API |

---

## 📊 QM9 Properties Predicted

- **μ** (Dipole moment)
- **α** (Polarizability)
- **Gap** (HOMO-LUMO gap)
- **Cv** (Heat capacity)
- **num_atoms** (Number of atoms)

---

## 🚀 Getting Started

### Prerequisites

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Qdrant Vector Database
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key

# LLM Provider
OPENROUTER_API_KEY=your_openrouter_key
LLM_MODEL=x-ai/grok-4.1-fast  # optional, default shown

# Model Paths (optional - defaults to Hugging Face Hub)
MODEL_T5_HUB=Dahyunn/molT5-finetuned
MODEL_CHEMBERTA_HUB=Dahyunn/chemberta-qm9
```

### Running the Application

**Web Interface:**
```bash
python app.py
```
Access at `http://localhost:7860`

**Programmatic Usage:**
```python
from agent import run_pipeline

constraints = {
    "mu": 2.5,
    "alpha": 70,
    "gap": 0.3,
    "Cv": 30,
    "max_atoms": 20
}

result = run_pipeline(constraints, max_iterations=2)
print(result["topk"])  # Top candidate molecules
print(result["predictions"])  # Predicted properties
print(result["explanations"])  # LLM explanations
```

---

## 🔌 API Endpoints

### REST API

**Health Check:**
```bash
GET /health
```

**Generate Molecules:**
```bash
POST /generate
Content-Type: application/json

{
  "mu": 2.5,
  "alpha": 70.0,
  "gap": 0.3,
  "Cv": 30.0,
  "max_atoms": 20,
  "max_iterations": 2
}
```

**Response:**
```json
{
  "status": "success",
  "passed_constraints": true,
  "iterations": 2,
  "topk": [...],
  "predictions": [...],
  "explanations": [...]
}
```

---

## 📁 Project Structure

```
AI model/
├── agent.py              # Core pipeline and LangGraph workflow
├── app.py                # Gradio UI and FastAPI endpoints
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

---

## 🧪 How It Works

### 1. **Parse & Encode**
Constraints are converted into natural language captions and encoded into embeddings using the MolT5 encoder.

### 2. **Vector Search**
Qdrant database is queried for molecules with similar property profiles.

### 3. **Generative Approach**
MolT5 generates new SMILES strings based on the constraint caption.

### 4. **Validation & Filtering**
RDKit validates chemical structures and filters invalid molecules.

### 5. **Property Prediction**
ChemBERTa predicts QM9 properties for each valid candidate.

### 6. **LLM Evaluation**
Grok LLM evaluates whether candidates meet constraints and provides feedback.

### 7. **Iterative Optimization**
If constraints aren't met, LLM generates an improved prompt and the process repeats (up to `max_iterations`).

### 8. **Ranking & Explanation**
Candidates are ranked by evaluation score, and LLM provides scientific explanations for top picks.

---

## 🎛️ Configuration

Key parameters in `agent.py`:

```python
# Generation settings
num_return_sequences=5    # Number of molecules per iteration
top_k=50, top_p=0.95      # Sampling parameters
temperature=0.8           # Generation diversity

# Search settings
limit=5                   # Vector search results

# Pipeline settings
max_iterations=2          # Optimization loops
```

---

## 📝 Example Output

**Input:**
```python
{
  "mu": 2.5,
  "alpha": 70,
  "gap": 0.3,
  "Cv": 30,
  "max_atoms": 20
}
```

**Output:**
```python
{
  "topk": [
    {"smiles": "CC(C)OC(=O)C1=CC=CC=C1"},
    {"smiles": "CC1=CC=C(C=C1)C(=O)O"},
    ...
  ],
  "predictions": [
    {"mu": 2.48, "alpha": 71.2, "gap": 0.31, "Cv": 29.8, "num_atoms": 18},
    ...
  ],
  "explanations": [
    "This molecule exhibits a dipole moment close to target due to...",
    ...
  ],
  "passed_constraints": true,
  "iteration": 2
}
```

---

## ⚙️ Performance Notes

- **First run**: Models download automatically from Hugging Face Hub (may take several minutes)
- **Subsequent runs**: Models are cached locally for faster startup
- **GPU acceleration**: Automatically uses CUDA if available
- **Memory**: Requires ~4GB RAM minimum (8GB+ recommended)

---

## 🔒 Security

**Important:** This repository contains example API keys for demonstration purposes only. 

⚠️ **Never commit real API keys to version control!**

For production deployment:
1. Remove all hardcoded credentials from `agent.py`
2. Use environment variables exclusively
3. Store secrets in secure vaults (e.g., GitHub Secrets, AWS Secrets Manager)
4. Rotate API keys regularly

---

## 📄 License

This project is part of the Dicoding Capstone submission.

---

## 👥 Authors

Developed for Dicoding Machine Learning Learning Path Capstone Project.

---

## 🙏 Acknowledgments

- **MolT5** - Molecular property-guided generation
- **ChemBERTa** - SMILES-based property prediction
- **Qdrant** - Vector similarity search
- **LangGraph** - Agentic workflow orchestration
- **OpenRouter** - LLM API access
