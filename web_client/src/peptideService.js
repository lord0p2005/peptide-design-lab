const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : 'https://glassofwine-peptide-design-lab-api.hf.space';

const TIMEOUT_MS = 15000; // Increased to 15s to allow for backend cold starts

async function fetchWithTimeout(resource, options = {}) {
    const timeout = options.timeout || TIMEOUT_MS;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

/**
 * Fetches peptide data from the SSOT API.
 */
export const fetchPeptides = async () => {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/peptides`);
        if (!response.ok) throw new Error('Peptide Database Offline');
        return await response.json();
    } catch (error) {
        console.warn("Using fallback local data:", error);
        // Fallback to local import if API is unavailable
        const localData = await import('./data/peptides.json');
        return localData.default;
    }
};

export const fetchPeptideById = async (id) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/peptides/${id}`);
        if (!response.ok) throw new Error('Peptide Details Unavailable');
        return await response.json();
    } catch (error) {
        console.warn("Finding peptide in local cache:", error);
        return null;
    }
};

/**
 * Simulates an asynchronous fetch of peptide property predictions.
 */
export const predictPeptideProperties = async (sequence) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sequence }),
            timeout: 15000
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

export const checkApiHealth = async () => {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/`, { timeout: 5000 });
        return response.ok;
    } catch {
        return false;
    }
};

export const analyzePeptide = async (sequence) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sequence }),
            timeout: 15000
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
