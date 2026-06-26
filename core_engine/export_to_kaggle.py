import json
import csv
import os

def export_to_csv():
    # Load enriched data
    json_path = os.path.join(os.path.dirname(__file__), "enriched_peptides.json")
    csv_path = os.path.join(os.path.dirname(__file__), "kaggle_peptides_dataset.csv")

    if not os.path.exists(json_path):
        print(f"❌ Error: {json_path} not found. Run fetch_pubchem_peptides.py first.")
        return

    with open(json_path, 'r') as f:
        data = json.load(f)

    if not data:
        print("❌ Error: No data found in JSON.")
        return

    # Extract headers
    headers = [
        "id", "name", "category", "market_trend", "sequence", "molecular_target",
        "clinical_use", "reported_side_effects", "chemical_formula",
        "mrna_sequence", "coding_dna", "template_dna"
    ]

    with open(csv_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()

        for p in data:
            row = {
                "id": p.get("id"),
                "name": p.get("name"),
                "category": p.get("category"),
                "market_trend": p.get("market_trend"),
                "sequence": p.get("sequence_one_letter"), # Map to sequence_one_letter
                "molecular_target": p.get("molecular_target"),
                "clinical_use": p.get("clinical_use"),
                "reported_side_effects": p.get("reported_side_effects"),
                "chemical_formula": p.get("chemical_formula"),
                "mrna_sequence": p.get("genetic_mapping", {}).get("mrna"),
                "coding_dna": p.get("genetic_mapping", {}).get("coding_dna"),
                "template_dna": p.get("genetic_mapping", {}).get("template_dna")
            }
            writer.writerow(row)

    print(f"🎉 SUCCESS: Exported {len(data)} peptides to {csv_path}")

if __name__ == "__main__":
    export_to_csv()
