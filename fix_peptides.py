import json
import os

enriched_path = "core_engine/enriched_peptides.json"
if os.path.exists(enriched_path):
    with open(enriched_path, "r") as f:
        data = json.load(f)

    # Simple fix to ensure all have administration_profile
    for p in data:
        if "administration_profile" not in p:
            # Default to Subcutaneous
            p["administration_profile"] = {
                "preferred_route": "Subcutaneous Injection",
                "half_life_index": "Medium",
                "rationale": "Standard peptide pharmacokinetic profile requiring parenteral delivery.",
                "optimized_routes": [
                    {"route": "Subcutaneous", "viability_score": 0.90, "rationale": "Standard parenteral route.", "required_modifications": []}
                ]
            }

    with open(enriched_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Fixed {len(data)} peptides in {enriched_path}")

# Fix root enriched_peptides.json too
if os.path.exists("enriched_peptides.json"):
    with open(enriched_path, "r") as f:
        data = json.load(f)
    with open("enriched_peptides.json", "w") as f:
        json.dump(data, f, indent=2)
