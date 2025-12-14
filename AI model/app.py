"""
Gradio Web Interface & API for Molecule Properties Prediction Agent
"""

import gradio as gr
import json
from typing import Dict, Any, Tuple
from agent import run_pipeline, PROPERTY_NAMES

# ============================================================
# HELPERS
# ============================================================

def format_results(result: Dict[str, Any]) -> Tuple[str, str, str]:
    topk = result.get("topk", [])
    predictions = result.get("predictions", [])
    explanations = result.get("explanations", [])
    logs = result.get("log", [])
    iteration = result.get("iteration", 0)
    passed_constraints = result.get("passed_constraints", False)

    summary_parts = ["## 🧪 Top Molecule Candidates\n"]
    summary_parts.append(f"**Status:** {'✅ Constraints Met' if passed_constraints else '⚠️ Best Effort'}\n")
    summary_parts.append(f"**Iterations:** {iteration}\n\n")

    if not topk:
        summary_parts.append("❌ No candidates found.\n")

    for idx, cand in enumerate(topk[:5]):
        smiles = cand.get("smiles", "N/A") if isinstance(cand, dict) else str(cand)
        pred = predictions[idx] if idx < len(predictions) else {}
        explanation = explanations[idx] if idx < len(explanations) else "No explanation"

        summary_parts.append(f"\n### Candidate {idx+1}\n")
        summary_parts.append(f"**SMILES:** `{smiles}`\n\n")
        summary_parts.append("**Predicted Properties:**\n")

        for prop in PROPERTY_NAMES:
            v = pred.get(prop, "N/A")
            summary_parts.append(f"- {prop}: {v}\n")

        summary_parts.append(f"\n**Analysis:** {explanation}\n---\n")

    summary_text = "".join(summary_parts)

    # JSON block
    candidates_json = json.dumps([
        {
            "rank": i + 1,
            "smiles": topk[i].get("smiles", "N/A") if isinstance(topk[i], dict) else str(topk[i]),
            "properties": predictions[i] if i < len(predictions) else {},
            "explanation": explanations[i] if i < len(explanations) else ""
        }
        for i in range(len(topk))
    ], indent=2)

    logs_text = (
        "=== PIPELINE LOG ===\n" +
        f"Iterations: {iteration}\n" +
        f"Constraints Met: {passed_constraints}\n\n"
    )
    logs_text += "\n".join([f"[{i}] {l}" for i, l in enumerate(logs, 1)]) if logs else "No logs available"

    return summary_text, candidates_json, logs_text



def discover_molecules(mu, alpha, gap, cv, max_atoms, max_iterations):
    try:
        constraints = {
            "mu": mu,
            "alpha": alpha,
            "gap": gap,
            "Cv": cv,
            "max_atoms": max_atoms,
        }
        result = run_pipeline(constraints, max_iterations=max_iterations)

        summary, json_data, logs = format_results(result)
        return logs, summary, json_data

    except Exception as e:
        return f"ERROR: {str(e)}", "Error", json.dumps({"error": str(e)})



def discover_molecules_json(payload: str, max_iterations: int = 2):
    try:
        constraints = json.loads(payload)
        result = run_pipeline(constraints, max_iterations=max_iterations)

        output = {
            "predictions": result.get("predictions", []),
            "topk": result.get("topk", []),
            "explanations": result.get("explanations", []),
        }
        return json.dumps(output, indent=2)

    except Exception as e:
        return json.dumps({
            "error": str(e),
            "predictions": [],
            "topk": [],
            "explanations": []
        }, indent=2)


def health_check():
    return {
        "status": "healthy",
        "service": "Molecule Agent",
        "models_loaded": True,
        "version": "1.0.0"
    }


# ============================================================
# BUILD GRADIO APP (UI + API)
# ============================================================

with gr.Blocks() as demo:

    # --------------------------------------------------------
    # TAB 1 — UI Molecule Discovery
    # --------------------------------------------------------
    with gr.Tab("Discovery"):
        gr.Markdown("## Set Your Constraints")

        mu = gr.Slider(0, 10, value=2.5, label="Dipole Moment (μ)")
        alpha = gr.Slider(10, 200, value=70, label="Polarizability (α)")
        gap = gr.Slider(0, 1, value=0.3, label="HOMO-LUMO Gap")
        cv = gr.Slider(5, 100, value=30, label="Heat Capacity (Cv)")
        max_atoms = gr.Slider(1, 50, value=20, label="Max atoms")
        iters = gr.Slider(1, 5, value=2, label="Iterations")

        btn = gr.Button("Run Discovery")

        logs_box = gr.Textbox(label="Logs")
        summary_md = gr.Markdown()
        json_box = gr.Code(language="json")

        btn.click(
            discover_molecules,
            inputs=[mu, alpha, gap, cv, max_atoms, iters],
            outputs=[logs_box, summary_md, json_box]
        )

    # --------------------------------------------------------
    # TAB 2 — API TESTER
    # --------------------------------------------------------
    with gr.Tab("API"):
        gr.Markdown("### Send JSON Payload")

        json_in = gr.Code(value='{"mu":2.5,"alpha":70,"gap":0.3,"Cv":30,"max_atoms":20}', language="json")
        it_api = gr.Slider(1, 5, value=2, label="Iterations")
        btn_api = gr.Button("Call API")
        json_out = gr.Code(language="json")

        btn_api.click(discover_molecules_json, inputs=[json_in, it_api], outputs=json_out)

    # --------------------------------------------------------
    # TAB 3 — Health Check
    # --------------------------------------------------------
    with gr.Tab("Health"):
        btn_h = gr.Button("Check")
        out_h = gr.JSON()

        btn_h.click(fn=health_check, inputs=[], outputs=out_h)


# ============================================================
# ENABLE OFFICIAL GRADIO API
# ============================================================

# Custom API route (Health)
import fastapi
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = fastapi.FastAPI()

class MoleculeRequest(BaseModel):
    mu: float = 2.5
    alpha: float = 70.0
    gap: float = 0.3
    Cv: float = 30.0
    max_atoms: int = 20
    max_iterations: int = 1

@app.get("/health")
def _health():
    return JSONResponse(health_check())

@app.post("/generate")
def generate_molecule(request: MoleculeRequest):
    """
    Generate molecules based on constraints
    """
    try:
        constraints = {
            "mu": request.mu,
            "alpha": request.alpha,
            "gap": request.gap,
            "Cv": request.Cv,
            "max_atoms": request.max_atoms,
        }
        result = run_pipeline(constraints, max_iterations=request.max_iterations)
        
        return JSONResponse({
            "status": "success",
            "passed_constraints": result.get("passed_constraints", False),
            "iterations": result.get("iteration", 0),
            "predictions": result.get("predictions", []),
            "topk": result.get("topk", []),
            "explanations": result.get("explanations", []),
        }, status_code=200)
    except Exception as e:
        return JSONResponse({
            "status": "error",
            "error": str(e),
            "predictions": [],
            "topk": [],
            "explanations": []
        }, status_code=500)

# Mount Gradio app to FastAPI
app = gr.mount_gradio_app(app, demo, path="/")

# ============================================================
# LAUNCH
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
