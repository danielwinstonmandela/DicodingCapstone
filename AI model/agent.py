"""
Molecule Properties Prediction Agent
Combines generative and search-based approaches for molecule discovery.
"""

# Standard library imports
import os
import re
import random
import operator
from typing import TypedDict, Any, List, Dict, Optional

# Third-party imports
import torch
import joblib
from transformers import T5Tokenizer, T5ForConditionalGeneration, AutoTokenizer, AutoModel
from qdrant_client import QdrantClient
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from huggingface_hub import hf_hub_download

try:
    from rdkit import Chem
except ImportError:
    Chem = None
    print("Warning: RDKit not available. Molecule validation will be skipped.")


# ============================
# CONFIGURATION
# ============================

# Model paths - Using Hugging Face Hub (solves storage limit issue)
# Set to local paths for development, or override with environment variables
MODEL_T5_HUB = os.getenv("MODEL_T5_HUB", "Dahyunn/molT5-finetuned")
MODEL_CHEMBERTA_HUB = os.getenv("MODEL_CHEMBERTA_HUB", "Dahyunn/chemberta-qm9")

# Local paths (fallback for development)
MODEL_T5_PATH = os.getenv("MODEL_T5_PATH", MODEL_T5_HUB)
MODEL_CHEMBERTA_FILE = "chemberta_multi_model.pth"
# Use the base ChemBERTa tokenizer since custom repo doesn't have tokenizer files
TOKENIZER_CHEMBERTA_PATH = "seyonec/ChemBERTa-zinc-base-v1"
SCALER_FILE = "label_scaler.pkl"

# Qdrant configuration - Use environment variables for security
QDRANT_URL = os.getenv("QDRANT_URL", "https://19c476d1-a6b0-44d3-9608-2da0dc66b0ee.europe-west3-0.gcp.cloud.qdrant.io:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.bFziFuDHQQofXjWdXoa5_34g2CqDm9YIoUtmGISPMZ0")
QDRANT_COLLECTION = "qm9_embeddings"

# LLM configuration - Use environment variables for security
LLM_MODEL = os.getenv("LLM_MODEL", "x-ai/grok-4.1-fast")
LLM_API_KEY = os.getenv("OPENROUTER_API_KEY", "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")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://openrouter.ai/api/v1")

# Property names for QM9 dataset
PROPERTY_NAMES = ['mu', 'alpha', 'gap', 'Cv', 'num_atoms']


# ============================
# MODEL INITIALIZATION
# ============================

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")


class ChemBERTaMulti(torch.nn.Module):
    """ChemBERTa model for multi-property prediction."""
    
    def __init__(self, n_outputs=5):
        super().__init__()
        self.encoder = AutoModel.from_pretrained("seyonec/ChemBERTa-zinc-base-v1")
        self.head = torch.nn.Sequential(
            torch.nn.Linear(768, 256),
            torch.nn.ReLU(),
            torch.nn.Linear(256, n_outputs)
        )

    def forward(self, input_ids, attention_mask):
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.last_hidden_state[:, 0, :]
        return self.head(pooled)


def load_models():
    """Load all required models and return them as a dictionary."""
    print("Loading models from Hugging Face Hub...")
    
    # Load T5 model and tokenizer from Hub (auto-downloads and caches)
    print(f"Loading T5 from: {MODEL_T5_PATH}")
    tokenizer_t5 = T5Tokenizer.from_pretrained(MODEL_T5_PATH)
    model_t5 = T5ForConditionalGeneration.from_pretrained(MODEL_T5_PATH)
    
    # Load ChemBERTa tokenizer from Hub
    print(f"Loading ChemBERTa tokenizer from: {TOKENIZER_CHEMBERTA_PATH}")
    tokenizer_chemberta = AutoTokenizer.from_pretrained(TOKENIZER_CHEMBERTA_PATH)
    
    # Download ChemBERTa model file from Hub
    print(f"Downloading ChemBERTa model from: {MODEL_CHEMBERTA_HUB}")
    model_path = hf_hub_download(
        repo_id=MODEL_CHEMBERTA_HUB,
        filename=MODEL_CHEMBERTA_FILE,
        cache_dir=None  # Use default cache
    )
    model_chemberta = ChemBERTaMulti(n_outputs=5)
    model_chemberta.load_state_dict(
        torch.load(model_path, map_location=device)
    )
    model_chemberta.eval()
    model_chemberta.to(device)
    
    # Download and load scaler from Hub
    print(f"Downloading scaler from: {MODEL_CHEMBERTA_HUB}")
    scaler_path = hf_hub_download(
        repo_id=MODEL_CHEMBERTA_HUB,
        filename=SCALER_FILE,
        cache_dir=None
    )
    scaler = joblib.load(scaler_path)
    
    # Initialize Qdrant client
    qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    
    # Initialize LLM
    llm = ChatOpenAI(
        model=LLM_MODEL,
        api_key=LLM_API_KEY,
        base_url=LLM_BASE_URL,
    )
    
    print("Models loaded successfully!")
    
    return {
        'tokenizer_t5': tokenizer_t5,
        'model_t5': model_t5,
        'tokenizer_chemberta': tokenizer_chemberta,
        'model_chemberta': model_chemberta,
        'scaler': scaler,
        'qdrant': qdrant,
        'llm': llm
    }


# Initialize models globally (will be used by functions)
models = load_models()
tokenizer_t5 = models['tokenizer_t5']
model_t5 = models['model_t5']
loaded_tokenizer = models['tokenizer_chemberta']
loaded_model = models['model_chemberta']
label_scaler = models['scaler']
qdrant_client = models['qdrant']
llm = models['llm']


# ============================
# CORE FUNCTIONS
# ============================

def generate_embedding(sample):
    """
    Generate embedding from text using T5 encoder.
    
    Args:
        sample: Dict with 'input' key containing text
        
    Returns:
        numpy array of embedding
    """
    inputs = tokenizer_t5(
        sample['input'], 
        return_tensors="pt", 
        padding=True, 
        truncation=True, 
        max_length=512
    )

    with torch.no_grad():
        encoder_outputs = model_t5.encoder(
            input_ids=inputs['input_ids'],
            attention_mask=inputs['attention_mask']
        )
        embedding = encoder_outputs.last_hidden_state.mean(dim=1).squeeze()

    return embedding.numpy()


def predict_properties(smiles):
    """
    Predict molecular properties from SMILES string.
    
    Args:
        smiles: SMILES string representation of molecule
        
    Returns:
        Dict with predicted properties (mu, alpha, gap, Cv, num_atoms)
    """
    encoded_input = loaded_tokenizer(
        smiles,
        padding='max_length',
        truncation=True,
        max_length=128,
        return_tensors="pt"
    )

    input_ids = encoded_input['input_ids'].to(device)
    attention_mask = encoded_input['attention_mask'].to(device)

    with torch.no_grad():
        predictions_scaled = loaded_model(input_ids, attention_mask).cpu().numpy()

    predictions_original_scale = label_scaler.inverse_transform(predictions_scaled)
    result = {
        name: float(predictions_original_scale[0][i]) 
        for i, name in enumerate(PROPERTY_NAMES)
    }
    return result



# ============================
# STATE DEFINITION
# ============================

class ChemState(TypedDict, total=False):
    """State for the molecule discovery pipeline."""
    constraints: Dict[str, Any]  # e.g., {"mu": X, "alpha": Y, "gap": Z, "Cv": W, "max_atoms": N}
    iteration: int
    max_iterations: int
    log: List[str]
    prompt: str
    candidates: List[Dict[str, Any]]
    predictions: List[Dict[str, Any]]
    cek_list: List[bool]
    is_optimize: bool
    llm_judge: List[str]
    topk: List[Dict[str, Any]]
    explanations: List[str]
    embedding: List[Any]
    search_results: List[Dict[str, Any]]
    passed_constraints: bool


# ============================
# PIPELINE NODES - GENERATION
# ============================


def generate_molecules(state: ChemState):
    """
    Generate molecule SMILES using MolT5 model.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with generated candidates
    """
    constraints = state.get("constraints", {})
    prompt_extra = state.get("prompt", "")
    iteration = state.get("iteration", 0)
    
    # Build caption from constraints
    caption_parts = [f"{key}={item}" for key, item in constraints.items()]
    caption = "properties: " + ", ".join(caption_parts)
    if prompt_extra:
        caption += " additional info: " + prompt_extra

    try:
        input_ids = tokenizer_t5(caption, return_tensors="pt").input_ids

        with torch.no_grad():
            outputs = model_t5.generate(
                input_ids,
                max_length=256,
                do_sample=True,
                top_k=50,
                top_p=0.95,
                temperature=0.8,
                num_return_sequences=5,
            )

        smiles_list = []
        for out in outputs:
            text = tokenizer_t5.decode(out, skip_special_tokens=True).strip()
            splitted = [s.strip() for s in re.split(r'[\n;]+', text) if s.strip()]
            smiles_list.extend(splitted)

        # Remove duplicates
        smiles_list = list(set(smiles_list))
        candidates = [{"smiles": s} for s in smiles_list]

    except Exception as e:
        candidates = []
        return {
            "candidates": candidates,
            "log": [f"generate_molecules failed: {e}"]
        }

    return {
        "candidates": candidates,
        "iteration": iteration + 1,
        "log": [f"Generated {len(candidates)} candidate molecules"]
    }


def filter_molecules(state: ChemState):
    """
    Filter molecules by chemical validity using RDKit.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with valid candidates only
    """
    candidates = state.get("candidates", [])
    filtered: List[Dict[str, Any]] = []
    
    if Chem is None:
        return {
            "candidates": filtered,
            "log": ["RDKit not available: skipping filter"]
        }

    for cand in candidates:
        smiles = cand.get("smiles") if isinstance(cand, dict) else cand
        if not smiles:
            continue
        try:
            mol_obj = Chem.MolFromSmiles(smiles)
            if mol_obj is not None:
                filtered.append(dict(cand))
        except Exception:
            continue

    return {
        "candidates": filtered,
        "log": [f"Filtered to {len(filtered)} valid molecules"]
    }


def predict_step(state: ChemState):
    """
    Predict QM9 properties for each candidate molecule.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with predictions
    """
    candidates = state.get("candidates", [])
    predictions = []
    
    for cand in candidates:
        smiles = cand.get("smiles")
        try:
            pred = predict_properties(smiles)
        except Exception as e:
            pred = {"error": str(e)}
        predictions.append(pred)

    return {
        "predictions": predictions,
        "log": [f"Predicted properties for {len(predictions)} molecules"]
    }


def evaluate_step(state: ChemState):
    """
    Evaluate predictions against constraints using LLM.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with evaluation results and optimization flag
    """
    predictions = state.get("predictions", [])
    candidates = state.get("candidates", [])
    constraints = state.get("constraints", {})

    cek_list: List[bool] = []
    llm_judge: List[str] = []

    if not candidates:
        return {
            "cek_list": cek_list,
            "llm_judge": llm_judge,
            "is_optimize": True,
            "passed_constraints": False,
            "log": ["No candidates to evaluate"]
        }

    # Build single prompt for all candidates
    prompt = (
        f"Evaluate the following molecules against QM9 constraints.\n"
        f"Constraints: {constraints}\n\n"
        "For each molecule below, answer with:\n"
        "1. Whether it meets all constraints (Yes/No)\n"
        "2. A one-sentence justification\n\n"
        "Molecules:\n"
    )
    
    for idx, cand in enumerate(candidates):
        smiles = cand.get("smiles")
        pred = predictions[idx] if idx < len(predictions) else {}
        prompt += f"{idx+1}. SMILES: {smiles} | Predicted Properties: {pred}\n"
    
    prompt += "\nProvide your evaluation for each molecule in order (1, 2, 3, ...)."
    
    try:
        response = llm.invoke(prompt) if hasattr(llm, "invoke") else llm.generate(prompt)
        content = getattr(response, "content", str(response))
        
        # Split response by lines and parse each molecule's evaluation
        lines = content.split('\n')
        current_eval = ""
        
        for line in lines:
            line_lower = line.lower()
            # Check if this line contains evaluation for a molecule
            if any(str(i) in line[:5] for i in range(1, len(candidates) + 1)):
                if current_eval:
                    # Process previous evaluation
                    is_ok = any(token in current_eval.lower() for token in ["yes", "true", "meets", "satisfi", "suitable", "pass"])
                    cek_list.append(bool(is_ok))
                    llm_judge.append(current_eval[:400])
                current_eval = line
            else:
                current_eval += " " + line
        
        # Process last evaluation
        if current_eval:
            is_ok = any(token in current_eval.lower() for token in ["yes", "true", "meets", "satisfi", "suitable", "pass"])
            cek_list.append(bool(is_ok))
            llm_judge.append(current_eval[:400])
        
        # Ensure we have evaluations for all candidates
        while len(cek_list) < len(candidates):
            cek_list.append(False)
            llm_judge.append("No evaluation found")
            
    except Exception as e:
        # Fallback: mark all as failed
        for _ in candidates:
            cek_list.append(False)
            llm_judge.append(f"Evaluation error: {e}")

    passed_constraints = sum(cek_list) >= 3
    is_optimize = not passed_constraints

    return {
        "cek_list": cek_list,
        "llm_judge": llm_judge,
        "is_optimize": is_optimize,
        "passed_constraints": passed_constraints,
        "log": [f"Evaluation complete. Passed: {passed_constraints}, Optimize: {is_optimize}"]
    }


def optimize_step(state: ChemState):
    """
    Generate improved prompt using LLM based on failed candidates.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with new generation prompt
    """
    candidates = state.get("candidates", [])
    predictions = state.get("predictions", [])
    llm_judge = state.get("llm_judge", [])
    cek_list = state.get("cek_list", [])
    constraints = state.get("constraints", {})

    prompt = (
        "We want to generate new molecules that better satisfy the following QM9 constraints:\n"
        f"Constraints: {constraints}\n\n"
        f"Current candidates and status:\n"
    )
    
    for idx, cand in enumerate(candidates):
        smiles = cand.get("smiles")
        pred = predictions[idx] if idx < len(predictions) else {}
        status = "OK" if (cek_list[idx] if idx < len(cek_list) else False) else "FAIL"
        judge = llm_judge[idx] if idx < len(llm_judge) else ""
        prompt += f"- {smiles} | Status: {status} | Predicted: {pred} | Judge: {judge}\n"

    prompt += (
        "\nProvide:\n"
        "1) A short explanation of why candidates failed (one sentence each if possible).\n"
        "2) A concrete generation prompt for MolT5 that increases the chance of meeting "
        "the constraints. Keep prompt concise and machine-friendly.\n"
    )

    try:
        response = llm.invoke(prompt) if hasattr(llm, "invoke") else llm.generate(prompt)
        content = getattr(response, "content", str(response))
    except Exception as e:
        content = f"LLM optimize_step failed: {e}"

    return {
        "prompt": content,
        "log": ["Generated optimization prompt for next iteration"]
    }


def rank_step(state: ChemState):
    """
    Rank candidates by evaluation score.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with top-k ranked molecules
    """
    candidates = state.get("candidates", [])
    predictions = state.get("predictions", [])
    cek_list = state.get("cek_list", [])

    scored: List[Dict[str, Any]] = []
    for i, cand in enumerate(candidates):
        score = 1 if (cek_list[i] if i < len(cek_list) else False) else 0
        pred = predictions[i] if i < len(predictions) else {}
        scored.append({"candidate": cand, "score": score, "pred": pred})

    # Sort by score descending
    scored_sorted = sorted(scored, key=lambda x: x["score"], reverse=True)
    topk = [item["candidate"] for item in scored_sorted[:3]]

    return {
        "topk": topk,
        "log": [f"Ranked top {len(topk)} molecules"]
    }


# ============================
# PIPELINE NODES - SEARCH
# ============================


def encode_step(state: ChemState):
    """
    Encode constraints to embedding vector.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with embedding
    """
    constraints = state.get("constraints", {})
    caption_parts = [f"{k}={v}" for k, v in constraints.items()]
    caption = "properties: " + ", ".join(caption_parts)

    try:
        emb = generate_embedding({'input': caption})
        embedding = emb if isinstance(emb, (list, tuple)) else getattr(emb, "tolist", lambda: emb)()
    except Exception as e:
        embedding = []
        return {
            "embedding": embedding,
            "log": [f"encode_step failed: {e}"]
        }

    return {
        "embedding": embedding,
        "log": [f"Encoded constraints to embedding (dim={len(embedding)})"]
    }


def search_step(state: ChemState):
    """
    Search similar molecules in vector database.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with search results
    """
    embedding = state.get("embedding", [])
    
    if not embedding:
        return {
            "search_results": [], 
            "log": ["No embedding available, skipping search"]
        }

    try:
        resp = qdrant_client.query_points(
            collection_name=QDRANT_COLLECTION,
            query=embedding,
            limit=5
        )
        search_results = getattr(resp, "points", resp)
        
        # Normalize results to list of dicts
        normalized = []
        for item in search_results:
            if isinstance(item, dict):
                normalized.append(item)
            else:
                payload = getattr(item, "payload", None) or {}
                normalized.append(payload)
                
    except Exception as e:
        normalized = []
        return {
            "search_results": normalized,
            "log": [f"search_step failed: {e}"]
        }

    return {
        "search_results": normalized,
        "log": [f"Found {len(normalized)} similar molecules from database"]
    }


def combine_results(state: ChemState):
    """
    Combine generative and search results.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with combined top-k results
    """
    topk = state.get("topk", []) or []
    predictions = state.get("predictions", []) or []
    search_results = state.get("search_results", []) or []

    # Parse search results and add to candidates
    for search_item in search_results:
        text = search_item.get("property", "")
        text = text.replace("properties:", "").strip()

        # Parse properties
        result = {}
        for prop_pair in text.split(","):
            if "=" not in prop_pair:
                continue
            key, value = prop_pair.split("=", 1)
            key = key.strip()
            value = value.strip()
            
            try:
                value = float(value) if "." in value else int(value)
            except (ValueError, AttributeError):
                pass
            result[key] = value
            
        predictions.append(result)
        topk.append({"smiles": search_item.get("smiles", "")})

    return {
        "topk": topk,
        "predictions": predictions,
        "log": [f"Combined results: {len(topk)} total candidates"]
    }


# ============================
# PIPELINE CONTROL
# ============================


def parse(state: ChemState):
    """
    Initialize and normalize state with default values.
    
    Args:
        state: Input state
        
    Returns:
        Normalized state with all required keys
    """
    defaults: ChemState = {
        "constraints": state.get("constraints", {}),
        "iteration": state.get("iteration", 0),
        "max_iterations": state.get("max_iterations", 1),
        "log": state.get("log", []),
        "prompt": state.get("prompt", ""),
        "candidates": state.get("candidates", []),
        "predictions": state.get("predictions", []),
        "cek_list": state.get("cek_list", []),
        "is_optimize": state.get("is_optimize", False),
        "llm_judge": state.get("llm_judge", []),
        "topk": state.get("topk", []),
        "explanations": state.get("explanations", []),
        "search_results": state.get("search_results", []),
        "passed_constraints": state.get("passed_constraints", False),
    }
    return defaults


def llm_explainer(state: ChemState):
    """
    Generate explanations for top candidates using LLM (single API call).
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with explanations for top-k molecules
    """
    topk = state.get("topk", []) or []
    predictions = state.get("predictions", []) or []
    constraints = state.get("constraints", {})
    
    if not topk:
        return {
            "topk": topk,
            "predictions": predictions,
            "explanations": [],
            "log": ["No top candidates to explain"]
        }
    
    # Build single prompt for all molecules
    prompt = (
        f"Provide concise explanations for the following molecules based on their properties and constraints.\n"
        f"Constraints: {constraints}\n\n"
        "For each molecule, provide a 1-2 sentence explanation highlighting key features "
        "and justifications related to the predictions.\n\n"
        "Molecules:\n"
    )
    
    for idx, item in enumerate(topk):
        smiles = item.get("smiles") if isinstance(item, dict) else item
        pred = predictions[idx] if idx < len(predictions) else {}
        prompt += f"{idx+1}. SMILES: {smiles} | Predicted: {pred}\n"
    
    prompt += "\nProvide explanations in order (1, 2, 3, ...), each on a new line starting with the number."
    
    try:
        response = llm.invoke(prompt) if hasattr(llm, "invoke") else llm.generate(prompt)
        content = getattr(response, "content", str(response))
        
        # Parse explanations from response
        explanations = []
        lines = content.split('\n')
        current_explanation = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line starts with a number (1., 2., etc.)
            if any(line.startswith(f"{i}.") or line.startswith(f"{i})") for i in range(1, len(topk) + 1)):
                if current_explanation:
                    explanations.append(current_explanation.strip())
                # Remove the number prefix
                current_explanation = re.sub(r'^\d+[\.\)]\s*', '', line)
            else:
                current_explanation += " " + line
        
        # Add the last explanation
        if current_explanation:
            explanations.append(current_explanation.strip())
        
        # Ensure we have explanations for all top-k molecules
        while len(explanations) < len(topk):
            explanations.append("No explanation generated")
            
        # Trim to exact number of top-k
        explanations = explanations[:len(topk)]
        
    except Exception as e:
        explanations = [f"LLM explanation failed: {e}"] * len(topk)
    
    return {
        "topk": topk,
        "predictions": predictions,
        "explanations": explanations,
        "log": [f"Generated explanations for {len(topk)} candidates (1 API call)"]
    }


# ============================
# GRAPH CONSTRUCTION
# ============================

def build_llm_pipeline():
    """
    Build the molecule discovery pipeline graph.
    
    Pipeline flow:
    1. Parse input
    2. Encode constraints to embedding
    3. Search vector database
    4. Generate new molecules
    5. Filter for validity
    6. Predict properties
    7. Evaluate against constraints
    8. Optimize prompt if needed (iterative)
    9. Rank candidates
    10. Combine generative and search results
    11. Generate explanations
    
    Returns:
        Compiled LangGraph pipeline
    """
    g = StateGraph(ChemState)

    # Register all nodes
    nodes = [
        ("parse", parse),
        ("encode", encode_step),
        ("search", search_step),
        ("generate_molecules", generate_molecules),
        ("filter", filter_molecules),
        ("predict", predict_step),
        ("evaluate", evaluate_step),
        ("optimize", optimize_step),
        ("rank", rank_step),
        ("combine", combine_results),
        ("llm_explainer", llm_explainer),
    ]

    for name, func in nodes:
        g.add_node(name, func)

    # Define sequential flow
    g.add_edge(START, "parse")
    g.add_edge("parse", "encode")
    g.add_edge("encode", "search")
    g.add_edge("search", "generate_molecules")
    g.add_edge("generate_molecules", "filter")
    g.add_edge("filter", "predict")
    g.add_edge("predict", "evaluate")

    def should_optimize(state: ChemState) -> str:
        """Decide whether to optimize or proceed to ranking."""
        iteration = state.get("iteration", 0)
        is_optimize = state.get("is_optimize", False)
        max_iter = state.get("max_iterations", 3)
        passed_constraints = state.get("passed_constraints", False)
        
        # Stop iterating if max iterations reached OR constraints already met
        if iteration >= max_iter or passed_constraints:
            return "rank"
        
        # Optimize if constraints not met and we have iterations left
        return "optimize" if is_optimize else "rank"

    g.add_conditional_edges(
        "evaluate",
        should_optimize,
        {"optimize": "optimize", "rank": "rank"}
    )

    # Complete the graph
    g.add_edge("optimize", "filter")  # Loop back for another iteration
    g.add_edge("rank", "combine")
    g.add_edge("combine", "llm_explainer")
    g.add_edge("llm_explainer", END)

    return g.compile()


# ============================
# PUBLIC API
# ============================

def run_pipeline(constraints: Dict[str, Any], max_iterations: int = 1):
    """
    Run the molecule discovery pipeline.
    
    Args:
        constraints: Dictionary of molecular property constraints
                    e.g., {"mu": 2.5, "alpha": 70, "gap": 0.3, "Cv": 30, "max_atoms": 20}
        max_iterations: Maximum number of optimization iterations
        
    Returns:
        Final state with top candidate molecules and explanations
    """
    app = build_llm_pipeline()
    
    initial_state: ChemState = {
        "constraints": constraints,
        "max_iterations": max_iterations,
        "iteration": 0,
        "log": [],
        "prompt": "",
        "candidates": [],
        "predictions": [],
        "cek_list": [],
        "is_optimize": False,
        "llm_judge": [],
        "topk": [],
        "explanations": [],
        "embedding": [],
        "search_results": [],
        "passed_constraints": False,
    }
    
    result = app.invoke(initial_state)
    return result


def run_stream(constraints: Dict[str, Any], max_iterations: int = 1):
    """
    Run pipeline with streaming to see state changes at each node.
    
    Args:
        constraints: Dictionary of molecular property constraints
        max_iterations: Maximum number of optimization iterations
        
    Yields:
        Tuple of (node_name, updated_state) for each step
    """
    app = build_llm_pipeline()
    
    initial_state: ChemState = {
        "constraints": constraints,
        "max_iterations": max_iterations,
        "iteration": 0,
        "log": [],
        "prompt": "",
        "candidates": [],
        "predictions": [],
        "cek_list": [],
        "is_optimize": False,
        "llm_judge": [],
        "topk": [],
        "explanations": [],
        "embedding": [],
        "search_results": [],
        "passed_constraints": False,
    }
    
    # Stream through each node and yield state updates
    for output in app.stream(initial_state):
        yield output


# ============================
# MAIN
# ============================


