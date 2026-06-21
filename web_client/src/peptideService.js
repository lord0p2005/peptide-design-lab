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
 * Calls the live Hugging Face ESM-2 AI API to get real-time biophysical predictions.
 * @param {string} sequence - The amino acid sequence (e.g., "GHK")
 */
export const predictPeptideProperties = async (sequence) => {
  try {
    const response = await fetch("https://glassofwine-peptide-design-lab-api.hf.space/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sequence }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI Prediction failed:", error);
    return null;
  }
};
