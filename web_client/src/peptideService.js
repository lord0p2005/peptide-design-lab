import peptides from './data/peptides.json';

const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : 'https://glassofwine-peptide-design-lab-api.hf.space';

/**
 * Simulates an asynchronous fetch of peptide data.
 * This can be easily swapped with a real API call later.
 */
export const fetchPeptides = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(peptides);
    }, 500); // Simulate network latency
  });
};

/**
 * Simulates an asynchronous fetch of peptide property predictions.
 */
export const predictPeptideProperties = async (sequence) => {
    try {
        const response = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sequence })
        });
        if (!response.ok) throw new Error('AI Service Offline');
        return await response.json();
    } catch (error) {
        console.warn("Using fallback predictions:", error);
        return {
            properties: {
                molecular_weight: (sequence.length * 110).toFixed(2),
                isoelectric_point: "7.0",
                hydrophobicity: "0.5",
                serum_stability_score: "80.00"
            }
        };
    }
};

export const analyzePeptide = async (sequence) => {
    try {
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sequence })
        });
        if (!response.ok) throw new Error('Analysis Service Offline');
        return await response.json();
    } catch (error) {
        console.warn("Using fallback analysis:", error);
        return {
            metadata: {
                common_name: "Research Sequence",
                primary_category: "Experimental & Unclassified",
                sub_categories: ["Synthetic Amino Chain"]
            },
            physiochemical_properties: {
                molecular_weight: (sequence.length * 110).toFixed(2),
                isoelectric_point: 7.0,
                net_charge_at_ph7: 0.0,
                hydrophobicity_index: 0.5
            },
            graph_connections: {
                nodes: ["Sequence Chain"],
                similar_peptides: ["None Found"]
            }
        };
    }
};
