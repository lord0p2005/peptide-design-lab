import torch
from transformers import AutoTokenizer, EsmModel
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
import re

app = FastAPI(title="Peptide Intelligence API")

# Load ESM-2 model and tokenizer
model_name = "facebook/esm2_t6_8M_UR50D"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = EsmModel.from_pretrained(model_name)
model.eval()

# Biophysical Constants
AMINO_ACID_WEIGHTS = {
    'A': 71.07, 'R': 156.18, 'N': 114.10, 'D': 115.08, 'C': 103.13,
    'Q': 128.12, 'E': 129.11, 'G': 57.05, 'H': 137.14, 'I': 113.15,
    'L': 113.15, 'K': 128.17, 'M': 131.19, 'F': 147.17, 'P': 97.11,
    'S': 87.07, 'T': 101.10, 'W': 186.20, 'Y': 163.17, 'V': 99.13
}

# Kyte-Doolittle Hydrophobicity Scale
HYDROPHOBICITY_SCALE = {
    'A': 1.8, 'R': -4.5, 'N': -3.5, 'D': -3.5, 'C': 2.5, 'Q': -3.5,
    'E': -3.5, 'G': -0.4, 'H': -3.2, 'I': 4.5, 'L': 3.8, 'K': -3.9,
    'M': 1.9, 'F': 2.8, 'P': -1.6, 'S': -0.8, 'T': -0.7, 'W': -0.9,
    'Y': -1.3, 'V': 4.2
}

# pKa values for Isoelectric Point calculation (Bjellqvist et al.)
PKA_VALUES = {
    'N-term': 9.69, 'C-term': 2.34,
    'R': 12.48, 'D': 3.86, 'C': 8.33, 'E': 4.25, 'H': 6.00, 'K': 10.53, 'Y': 10.07
}

class PeptideRequest(BaseModel):
    sequence: str

    @field_validator('sequence')
    @classmethod
    def validate_sequence(cls, v: str) -> str:
        v = v.strip().upper()
        if not v:
            raise ValueError('Sequence cannot be empty')
        if not re.match(r'^[ACDEFGHIKLMNPQRSTVWY]+$', v):
            raise ValueError('Sequence contains non-standard amino acids')
        return v

def calculate_molecular_weight(sequence):
    # Sum of residue weights + weight of H2O (18.015) for the termini
    weight = sum(AMINO_ACID_WEIGHTS.get(aa, 0) for aa in sequence)
    return round(weight + 18.015, 2)

def calculate_isoelectric_point(sequence):
    def net_charge(ph):
        charge = 0.0
        # N-terminal
        charge += 1.0 / (1.0 + 10**(ph - PKA_VALUES['N-term']))
        # C-terminal
        charge -= 1.0 / (1.0 + 10**(PKA_VALUES['C-term'] - ph))

        for aa in sequence:
            if aa in ['R', 'K', 'H']:
                charge += 1.0 / (1.0 + 10**(ph - PKA_VALUES[aa]))
            elif aa in ['D', 'E', 'C', 'Y']:
                charge -= 1.0 / (1.0 + 10**(PKA_VALUES[aa] - ph))
        return charge

    # Binary search for pH where net charge is 0
    low, high = 0.0, 14.0
    for _ in range(20):
        mid = (low + high) / 2
        if net_charge(mid) > 0:
            low = mid
        else:
            high = mid
    return round((low + high) / 2, 2)

def calculate_hydrophobicity(sequence):
    values = [HYDROPHOBICITY_SCALE.get(aa, 0) for aa in sequence]
    return round(sum(values) / len(values), 2)

@app.get("/")
def read_root():
    return {"message": "Peptide Intelligence API is running", "model": model_name}

@app.post("/predict")
def predict(request: PeptideRequest):
    sequence = request.sequence

    # ESM-2 Embeddings
    inputs = tokenizer(sequence, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)

    # Get mean of last hidden states as sequence embedding
    embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().tolist()

    # Biophysical Properties
    mw = calculate_molecular_weight(sequence)
    pi = calculate_isoelectric_point(sequence)
    hydrophobicity = calculate_hydrophobicity(sequence)

    # Mock Serum Stability Score (AI-predicted)
    # In a real scenario, this would be a secondary head on the ESM-2 model
    # For now, we'll derive it from the embeddings to simulate 'intelligence'
    stability_score = round(torch.sigmoid(torch.tensor(embeddings[0])).item() * 100, 2)

    return {
        "sequence": sequence,
        "properties": {
            "molecular_weight": mw,
            "isoelectric_point": pi,
            "hydrophobicity": hydrophobicity,
            "serum_stability_score": stability_score
        },
        "embedding_summary": embeddings[:5]  # Return first 5 dimensions as a sample
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
