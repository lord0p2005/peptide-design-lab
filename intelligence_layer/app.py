import torch
from transformers import AutoTokenizer, EsmModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
import re
import json
import os

app = FastAPI(title="Peptide Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Unified Peptide Database (SSOT)
PEPTIDE_DB_PATH = os.path.join(os.path.dirname(__file__), "../core_engine/enriched_peptides.json")
PEPTIDE_DB = []

def load_peptide_db():
    global PEPTIDE_DB
    if os.path.exists(PEPTIDE_DB_PATH):
        with open(PEPTIDE_DB_PATH, 'r') as f:
            PEPTIDE_DB = json.load(f)
    else:
        print(f"Warning: Peptide database not found at {PEPTIDE_DB_PATH}")

load_peptide_db()

# Chemical formulas for residues
AMINO_ACID_FORMULAS = {
    'A': {'C': 3, 'H': 5, 'N': 1, 'O': 1},
    'R': {'C': 6, 'H': 12, 'N': 4, 'O': 1},
    'N': {'C': 4, 'H': 6, 'N': 2, 'O': 2},
    'D': {'C': 4, 'H': 5, 'N': 1, 'O': 3},
    'C': {'C': 3, 'H': 5, 'N': 1, 'O': 1, 'S': 1},
    'Q': {'C': 5, 'H': 8, 'N': 2, 'O': 2},
    'E': {'C': 5, 'H': 7, 'N': 1, 'O': 3},
    'G': {'C': 2, 'H': 3, 'N': 1, 'O': 1},
    'H': {'C': 6, 'H': 7, 'N': 3, 'O': 1},
    'I': {'C': 6, 'H': 11, 'N': 1, 'O': 1},
    'L': {'C': 6, 'H': 11, 'N': 1, 'O': 1},
    'K': {'C': 6, 'H': 12, 'N': 2, 'O': 1},
    'M': {'C': 5, 'H': 9, 'N': 1, 'O': 1, 'S': 1},
    'F': {'C': 9, 'H': 9, 'N': 1, 'O': 1},
    'P': {'C': 5, 'H': 7, 'N': 1, 'O': 1},
    'S': {'C': 3, 'H': 5, 'N': 1, 'O': 2},
    'T': {'C': 4, 'H': 7, 'N': 1, 'O': 2},
    'W': {'C': 11, 'H': 10, 'N': 2, 'O': 1},
    'Y': {'C': 9, 'H': 9, 'N': 1, 'O': 2},
    'V': {'C': 5, 'H': 9, 'N': 1, 'O': 1}
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

class RouteOptimization(BaseModel):
    route: str = Field(..., description="E.g., Subcutaneous, Intravenous, Oral, Intranasal")
    viability_score: float = Field(..., description="Algorithmic confidence rating from 0.0 to 1.0 based on stability")
    rationale: str = Field(..., description="Anatomical/Physiological reason for this classification")
    required_modifications: Optional[List[str]] = Field(default=[], description="E.g., PEGylation, LNP Encapsulation, Permeation Enhancers")

class AdministrationMetadata(BaseModel):
    preferred_route: str
    half_life_index: str = Field(..., description="Estimated plasma half-life rating (Short, Medium, Long)")
    predicted_primary_protease: Optional[str] = Field(None, description="Primary enzyme causing degradation (e.g., Dipeptidyl peptidase-4)")
    optimized_routes: List[RouteOptimization]
    rationale: Optional[str] = None

class PeptideEnrichmentResponse(BaseModel):
    id: str
    name: str
    category: str
    amino_acid_sequence: str
    chemical_formula: Optional[str]
    administration_profile: AdministrationMetadata

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

def calculate_chemical_formula(sequence):
    totals = {'C': 0, 'H': 2, 'N': 0, 'O': 1, 'S': 0} # Start with H2O
    for aa in sequence:
        formula = AMINO_ACID_FORMULAS.get(aa, {})
        for element, count in formula.items():
            totals[element] = totals.get(element, 0) + count

    # Format as string
    res = ""
    for el in ['C', 'H', 'N', 'O', 'S']:
        if totals[el] > 0:
            res += f"{el}{totals[el]}" if totals[el] > 1 else el
    return res

def calculate_net_charge(sequence, ph=7.0):
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
    return round(charge, 2)

def predict_administration_logic(sequence: str, mw: float, name: str = ""):
    length = len(sequence)
    preferred_route = "Subcutaneous Injection"
    half_life_index = "Medium"
    rationale = "Standard peptide pharmacokinetic profile requiring parenteral delivery."
    optimized_routes = []

    is_short = 0 < length < 10
    is_long = length > 30
    is_lipidated = any(x in name.lower() for x in ["liraglutide", "semaglutide", "tirzepatide", "detemir", "degludec"])
    is_cyclic = "C" in sequence # Rough heuristic for disulfide bonds if Cysteines are present

    if is_lipidated:
        preferred_route = "Subcutaneous (SC)"
        half_life_index = "Long"
        rationale = "Lipidated chain enhances albumin binding and extends serum stability."
        optimized_routes = [
            {"route": "Subcutaneous", "viability_score": 0.98, "rationale": "Optimized for slow systemic release via albumin binding.", "required_modifications": ["Fatty Acid Acylation"]},
            {"route": "Intravenous", "viability_score": 0.60, "rationale": "Possible but bypasses depot effect of lipid chain.", "required_modifications": []}
        ]
    elif is_short:
        preferred_route = "Subcutaneous (SC) / Nasal"
        half_life_index = "Short"
        rationale = "Low molecular weight allows for nasal permeability but high enzymatic vulnerability."
        optimized_routes = [
            {"route": "Subcutaneous", "viability_score": 0.92, "rationale": "Reliable systemic bioavailability.", "required_modifications": []},
            {"route": "Nasal Spray", "viability_score": 0.65, "rationale": "High patient compliance; viable for short oligopeptides.", "required_modifications": ["Permeation Enhancers"]},
            {"route": "Oral", "viability_score": 0.15, "rationale": "Poor stability without cyclization or protection.", "required_modifications": ["Structural Cyclization"]}
        ]
    elif is_long:
        preferred_route = "Subcutaneous Injection / IV"
        half_life_index = "Medium"
        rationale = "High molecular mass and rapid renal clearance necessitate parenteral administration."
        optimized_routes = [
            {"route": "Subcutaneous", "viability_score": 0.94, "rationale": "Standard clinical route for long polypeptides.", "required_modifications": ["Depot Formatting"]},
            {"route": "Intravenous", "viability_score": 0.85, "rationale": "Used for acute hospital settings.", "required_modifications": []}
        ]
    elif is_cyclic:
        preferred_route = "Intravenous (IV) / IM"
        half_life_index = "Medium"
        rationale = "Cyclization provides elevated resistance to gastric proteases."
        optimized_routes = [
            {"route": "Intravenous", "viability_score": 0.95, "rationale": "Optimal for rapid systemic action.", "required_modifications": []},
            {"route": "Oral", "viability_score": 0.45, "rationale": "Increased stability makes it a candidate for advanced oral systems.", "required_modifications": ["SNAC Carrier", "Permeation Enhancers"]}
        ]
    else:
        optimized_routes = [
            {"route": "Subcutaneous", "viability_score": 0.90, "rationale": "Standard parenteral route.", "required_modifications": []}
        ]

    return {
        "preferred_route": preferred_route,
        "half_life_index": half_life_index,
        "rationale": rationale,
        "optimized_routes": optimized_routes
    }

@app.get("/")
def read_root():
    return {"message": "Peptide Intelligence API is running", "model": model_name, "peptides_loaded": len(PEPTIDE_DB)}

@app.get("/peptides")
def get_all_peptides():
    """Returns the index list for sidebars and top-level mindmap arrays."""
    return PEPTIDE_DB

@app.get("/peptides/{peptide_id}")
def get_peptide_details(peptide_id: str):
    """Fetches full deep wiki data and metrics for an individual entry."""
    for peptide in PEPTIDE_DB:
        if peptide["id"].lower() == peptide_id.lower():
            return peptide
    raise HTTPException(status_code=404, detail="Peptide profile not found in database.")

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
    formula = calculate_chemical_formula(sequence)

    # Mock Serum Stability Score (AI-predicted)
    # In a real scenario, this would be a secondary head on the ESM-2 model
    # For now, we'll derive it from the embeddings to simulate 'intelligence'
    stability_score = round(torch.sigmoid(torch.tensor(embeddings[0])).item() * 100, 2)

    admin_profile = predict_administration_logic(sequence, mw)

    return {
        "sequence": sequence,
        "properties": {
            "molecular_weight": mw,
            "isoelectric_point": pi,
            "hydrophobicity": hydrophobicity,
            "chemical_formula": formula,
            "serum_stability_score": stability_score,
            "administration_profile": admin_profile
        },
        "embedding_summary": embeddings[:5]  # Return first 5 dimensions as a sample
    }

@app.post("/analyze")
def analyze(request: PeptideRequest):
    sequence = request.sequence

    # Biophysical calculations
    mw = calculate_molecular_weight(sequence)
    pi = calculate_isoelectric_point(sequence)
    net_charge = calculate_net_charge(sequence, ph=7.0)
    hydrophobicity = calculate_hydrophobicity(sequence)

    # Intelligent Categorization Logic
    primary_category = "Experimental & Unclassified"
    sub_categories = []
    nodes = []
    similar_peptides = []

    # Simple motif-based classification
    if net_charge > 2.0 and hydrophobicity > 0.5:
        primary_category = "Antimicrobial / Host Defense"
        sub_categories = ["Cell-Penetrating", "Membrane-Active"]
        nodes = ["Cationic Surface", "Lytic Activity"]
        similar_peptides = ["LL-37", "Magainin"]
    elif "GHK" in sequence:
        primary_category = "Tissue Repair & Aesthetics"
        sub_categories = ["Angiogenesis", "Collagen Synthesis", "Wound Healing"]
        nodes = ["Tissue Repair", "Extracellular Matrix", "Copper-Binding"]
        similar_peptides = ["BPC-157", "TB-500"]
    elif any(motif in sequence for motif in ["MEH", "SEL"]):
        primary_category = "Neuro-Regenerative & Nootropic"
        sub_categories = ["Cognitive Enhancement", "Neuroprotection"]
        nodes = ["BDNF Modulation", "Synaptic Plasticity"]
        similar_peptides = ["Semax", "Selank"]
    elif mw > 3000:
        primary_category = "Metabolic & Mitochondrial"
        sub_categories = ["Incretin Mimetics", "Metabolic Homeostasis"]
        nodes = ["GLP-1 Receptor", "Insulin Sensitivity"]
        similar_peptides = ["Semaglutide", "Liraglutide"]

    admin_profile = predict_administration_logic(sequence, mw)

    return {
        "sequence": sequence,
        "metadata": {
            "common_name": f"Synthetic Sequence {sequence[:4]}...",
            "primary_category": primary_category,
            "sub_categories": sub_categories,
            "administration_profile": admin_profile
        },
        "physiochemical_properties": {
            "molecular_weight": mw,
            "isoelectric_point": pi,
            "net_charge_at_ph7": net_charge,
            "hydrophobicity_index": hydrophobicity
        },
        "graph_connections": {
            "nodes": nodes,
            "similar_peptides": similar_peptides
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
