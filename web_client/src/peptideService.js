import peptides from './data/peptides.json';

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
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                properties: {
                    molecular_weight: (sequence.length * 110).toFixed(2),
                    isoelectric_point: "7.0",
                    hydrophobicity: "0.5",
                    serum_stability_score: "0.8"
                }
            });
        }, 800);
    });
};
