---
title: Asah - Molecule Properties Prediction Agent
emoji: 🧪
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: 6.0.1
app_file: app.py
pinned: false
---

# 🧪 Molecule Properties Prediction Agent

Discover novel molecules that meet your specific QM9 property constraints using advanced AI.

## Features

- 🤖 **Generative AI** (MolT5) for creating new molecule candidates
- 🔍 **Vector Search** for finding similar molecules in database
- 📊 **Property Prediction** (ChemBERTa) for accurate QM9 properties
- 🧠 **LLM Evaluation** for intelligent candidate ranking

## Configuration

This Space requires environment variables to be set in the Hugging Face Spaces settings:

1. `QDRANT_URL` - Your Qdrant vector database URL
2. `QDRANT_API_KEY` - Your Qdrant API key
3. `OPENROUTER_API_KEY` - Your OpenRouter API key for LLM access

## Usage

1. Set your molecular property constraints (μ, α, Gap, Cv, max atoms)
2. Click "🚀 Discover Molecules"
3. Review top candidates with predicted properties and explanations

## Models Used

- **MolT5**: Dahyunn/molT5-finetuned
- **ChemBERTa**: Dahyunn/chemberta-qm9
- **LLM**: Grok-4.1-fast via OpenRouter
