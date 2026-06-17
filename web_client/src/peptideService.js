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
