import requests
import json
import os
import subprocess
import re
import time
import argparse

# Mapping for 3-letter to 1-letter amino acids
AA_MAP = {
    'Ala': 'A', 'Arg': 'R', 'Asn': 'N', 'Asp': 'D', 'Cys': 'C',
    'Gln': 'Q', 'Glu': 'E', 'Gly': 'G', 'His': 'H', 'Ile': 'I',
    'Leu': 'L', 'Lys': 'K', 'Met': 'M', 'Phe': 'F', 'Pro': 'P',
    'Ser': 'S', 'Thr': 'T', 'Trp': 'W', 'Tyr': 'Y', 'Val': 'V',
    'Aib': 'X', 'D-Phe': 'X', 'D-2Nal': 'X', 'Nal': 'X', 'Ac': ''
}

def get_cid_by_name(name):
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{name}/JSON"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data['PC_Compounds'][0]['id']['id']['cid']
    except Exception as e:
        print(f"Error finding CID for {name}: {e}")
    return None

def get_properties(cid):
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/property/MolecularWeight,IsomericSMILES,MolecularFormula/JSON"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()['PropertyTable']['Properties'][0]
    except Exception as e:
        print(f"Error getting properties for CID {cid}: {e}")
    return {}

def get_description(cid):
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/description/JSON"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            descriptions = response.json().get('InformationList', {}).get('Information', [])
            for desc in descriptions:
                if 'Description' in desc:
                    return desc['Description']
    except Exception as e:
        print(f"Error getting description for CID {cid}: {e}")
    return "No clinical description available via PubChem."

def get_sequence_data(cid):
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/{cid}/JSON"
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            data = response.json()
            sections = data.get('Record', {}).get('Section', [])
            for section in sections:
                if section.get('TOCHeading') == 'Biologic Description':
                    subsections = section.get('Section', [])
                    for sub in subsections:
                        if sub.get('TOCHeading') == 'Biologic Line Notation':
                            info = sub.get('Information', [])
                            seq_one = None
                            seq_three_str = None
                            for i in info:
                                if i.get('Name') == 'Sequence':
                                    seq_one = i.get('Value', {}).get('StringWithMarkup', [{}])[0].get('String', '')
                                if i.get('Name') == 'IUPAC Condensed':
                                    seq_three_str = i.get('Value', {}).get('StringWithMarkup', [{}])[0].get('String', '')
                            return seq_one, seq_three_str
    except Exception as e:
        print(f"Error getting sequence for CID {cid}: {e}")
    return None, None

def parse_three_letter_sequence(seq_three_str):
    if not seq_three_str:
        return []
    # Remove common peptide terminal groups and modifications
    clean_seq = re.sub(r'^H-|-OH$|-NH2$|Ac-', '', seq_three_str)

    # Handle D-amino acids and other hyphenated modifications
    pattern = r'(?:D-)?[A-Za-z0-9]{3,}'
    parts = re.findall(pattern, clean_seq)

    return [p for p in parts if p]

def fetch_peptide_data(name):
    print(f"🚀 Fetching data for: {name}...")
    cid = get_cid_by_name(name)
    if not cid:
        return None

    props = get_properties(cid)
    mw = float(props.get('MolecularWeight', 0))
    if mw > 6000:
        print(f"⚠️ {name} skipped: Molecular Weight {mw} > 6000 Da")
        return None

    seq_one, seq_three_str = get_sequence_data(cid)
    description = get_description(cid)

    if not seq_one and not seq_three_str:
        print(f"⚠️ {name} skipped: Could not retrieve amino acid sequence.")
        return None

    three_letter_list = parse_three_letter_sequence(seq_three_str)

    if not seq_one:
        mapped = []
        for aa in three_letter_list:
            if aa in AA_MAP:
                mapped.append(AA_MAP[aa])
            elif aa.startswith('D-'):
                mapped.append('X')
            else:
                mapped.append('X')
        seq_one = "".join([m for m in mapped if m])

    peptide_obj = {
        "id": name.lower().replace(" ", "-"),
        "name": name,
        "market_trend": "Automated Retrieval / Research Grade",
        "sequence_three_letter": three_letter_list,
        "sequence_one_letter": seq_one,
        "molecular_target": "Identified via PubChem CID " + str(cid),
        "clinical_use": description[:200] + "..." if len(description) > 200 else description,
        "reported_side_effects": "Consult clinical literature for safety profile.",
        "chemical_formula": props.get('MolecularFormula', "Unknown")
    }

    return peptide_obj

def search_by_keywords(keywords):
    print(f"🔍 Searching for clinical keywords: {keywords}...")
    found_cids = []
    for kw in keywords:
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{kw}/cids/JSON"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                cids = response.json().get('IdentifierList', {}).get('CID', [])
                found_cids.extend(cids)
        except:
            pass
    return list(set(found_cids))

def main():
    parser = argparse.ArgumentParser(description="Fetch peptide data from PubChem")
    parser.add_argument("--keywords", nargs="+", help="Keywords to search for")
    args = parser.parse_args()

    # Targeted list from requirements
    target_peptides = ["Epitalon", "MOTS-c", "CJC-1295", "Semax", "Ipamorelin", "Thymosin Alpha-1"]

    if args.keywords:
        target_peptides.extend(args.keywords)
        target_peptides = list(set(target_peptides))

    new_peptides = []

    for name in target_peptides:
        try:
            data = fetch_peptide_data(name)
            if data:
                new_peptides.append(data)
                print(f"✅ Successfully retrieved {name}")
            time.sleep(1)
        except Exception as e:
            print(f"Error processing {name}: {e}")

    if not new_peptides:
        print("❌ No peptides were retrieved.")
        return

    db_path = os.path.join(os.path.dirname(__file__), "peptides_db.json")
    if os.path.exists(db_path):
        with open(db_path, 'r') as f:
            try:
                db = json.load(f)
            except json.JSONDecodeError:
                db = {"peptides": []}
    else:
        db = {"peptides": []}

    existing_peptides = {p['id']: i for i, p in enumerate(db['peptides'])}
    added_count = 0
    updated_count = 0

    for np in new_peptides:
        if np['id'] not in existing_peptides:
            db['peptides'].append(np)
            added_count += 1
        else:
            idx = existing_peptides[np['id']]
            db['peptides'][idx] = np
            updated_count += 1

    with open(db_path, 'w') as f:
        json.dump(db, f, indent=2)

    print(f"💾 Updated {db_path}: {added_count} new, {updated_count} updated.")

    print("🧬 Running translator.py to update enriched data...")
    subprocess.run(["python3", "translator.py"], cwd=os.path.dirname(__file__))

if __name__ == "__main__":
    main()
