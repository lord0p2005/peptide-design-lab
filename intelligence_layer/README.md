---
title: Peptide Intelligence API
emoji: 🧬
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
---

# Peptide Intelligence API

A serverless Python API using Meta's ESM-2 protein language model to calculate real-time biophysical properties for custom peptide strings.

## Features

- **ESM-2 Model:** Uses `facebook/esm2_t6_8M_UR50D` for sequence embeddings.
- **Biophysical Properties:** Calculates Molecular Weight, Isoelectric Point (pI), and Hydrophobicity index.
- **AI-Predicted Stability:** Returns a mock Serum Stability Score derived from model embeddings.
- **FastAPI:** High-performance, production-ready API.

## Local Installation and Testing

Follow these steps to initialize and test the server locally:

### 1. Prerequisites
Ensure you have Python 3.9+ installed.

### 2. Setup Environment
```bash
# Navigate to the intelligence layer directory
cd intelligence_layer

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run the Server
```bash
python app.py
```
The server will start at `http://0.0.0.0:8000`.

### 4. Test the Endpoint
You can use `curl` to test the `/predict` endpoint:

```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{"sequence": "GHK"}'
```

Example Response:
```json
{
  "sequence": "GHK",
  "properties": {
    "molecular_weight": 340.37,
    "isoelectric_point": 10.11,
    "hydrophobicity": -2.5,
    "serum_stability_score": 53.19
  },
  "embedding_summary": [...]
}
```

## Hugging Face Space Deployment
This directory is configured for a Docker-based Hugging Face Space. Ensure the port is set to `7860` in the Dockerfile as required by Spaces.
