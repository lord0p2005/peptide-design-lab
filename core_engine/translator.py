import json
import os

# Standard Genetic Code Dictionary (RNA -> Amino Acid)
RNA_CODON_TABLE = {
    'UUU': 'F', 'UUC': 'F', 'UUA': 'L', 'UUG': 'L',
    'UCU': 'S', 'UCC': 'S', 'UCA': 'S', 'UCG': 'S',
    'UAU': 'Y', 'UAC': 'Y', 'UAA': 'STOP', 'UAG': 'STOP',
    'UGU': 'C', 'UGC': 'C', 'UGA': 'STOP', 'UGG': 'W',
    'CUU': 'L', 'CUC': 'L', 'CUA': 'L', 'CUG': 'L',
    'CCU': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'CAU': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'CGU': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
    'AUU': 'I', 'AUC': 'I', 'AUA': 'I', 'AUG': 'M',
    'ACU': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
    'AAU': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
    'AGU': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GUU': 'V', 'GUC': 'V', 'GUA': 'V', 'GUG': 'V',
    'GCU': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
    'GAU': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'GGU': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
}

# Human-Optimized Back-Translation (Amino Acid -> Highest Frequency Human Codon)
# This mimics how biotech companies engineer genetic sequences for optimal expression.
HUMAN_OPTIMIZED_CODONS = {
    'A': 'GCC', 'C': 'UGC', 'D': 'GAC', 'E': 'GAG', 'F': 'UUC',
    'G': 'GGC', 'H': 'CAC', 'I': 'AUC', 'K': 'AAG', 'L': 'CUG',
    'M': 'AUG', 'N': 'AAC', 'P': 'CCC', 'Q': 'CAG', 'R': 'CUG', # Note: CUG/AGA depending on organism
    'S': 'AGC', 'T': 'ACC', 'V': 'GUG', 'W': 'UGG', 'Y': 'UAC',
    'STOP': 'UGA'
}

class PeptideEngine:
    def __init__(self, db_path="peptides_db.json"):
        self.db_path = db_path
        self.peptides_db = self._load_database()

    def _load_database(self):
        if os.path.exists(self.db_path):
            with open(self.db_path, 'r') as f:
                return json.load(f).get("peptides", [])
        return []

    def get_peptide_by_id(self, peptide_id):
        for p in self.peptides_db:
            if p["id"] == peptide_id:
                return p
        return None

    def back_translate(self, one_letter_sequence):
        """Converts a 1-letter amino acid sequence into a human-optimized mRNA strand."""
        mrna_sequence = []
        for aa in one_letter_sequence.upper():
            if aa in HUMAN_OPTIMIZED_CODONS:
                mrna_sequence.append(HUMAN_OPTIMIZED_CODONS[aa])
            else:
                mrna_sequence.append("???") # Safety catch for non-standard entries
        return " ".join(mrna_sequence)

    def generate_dna_strands(self, mrna_sequence_str):
        """Derives Template and Coding DNA strands from an mRNA sequence."""
        clean_mrna = mrna_sequence_str.replace(" ", "").upper()
        
        # mRNA to Coding DNA (T replaces U)
        coding_dna = clean_mrna.replace("U", "T")
        
        # Coding DNA to Template DNA (Complementary pairing: A-T, T-A, C-G, G-C)
        complement = {'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'}
        template_dna = "".join([complement.get(base, "?") for base in coding_dna])
        
        # Format into readable 3-letter codon blocks
        chunk = lambda s: " ".join([s[i:i+3] for i in range(0, len(s), 3)])
        return chunk(coding_dna), chunk(template_dna)

if __name__ == "__main__":
    engine = PeptideEngine()
    
    print("🧬 RUNNING BATCH TRANSCRIPTION ENGINE...")
    print("=" * 50)
    
    compiled_outputs = []
    
    for peptide in engine.peptides_db:
        print(f"📦 Processing: {peptide['name']}...")
        
        # Run calculation pipeline
        mrna = engine.back_translate(peptide['sequence_one_letter'])
        coding_dna, template_dna = engine.generate_dna_strands(mrna)
        
        # Build the enriched structural payload
        enriched_peptide = peptide.copy()
        enriched_peptide["genetic_mapping"] = {
            "mrna": mrna,
            "coding_dna": coding_dna,
            "template_dna": template_dna
        }
        compiled_outputs.append(enriched_peptide)
        
    # Export this enriched data so our future web UI can read it instantly
    export_path = "enriched_peptides.json"
    with open(export_path, 'w') as f:
        json.dump(compiled_outputs, f, indent=2)
        
    print("=" * 50)
    print(f"🎉 SUCCESS: Enriched {len(compiled_outputs)} peptides.")
    print(f"📁 Exported pipeline output to: core_engine/{export_path}")
    print("=" * 50)