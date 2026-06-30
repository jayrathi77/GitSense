import { useState } from 'react';
import { analyzeProfile } from '../api/analysisApi';

export const useAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async (username) => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyzeProfile(username);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, error };
};

export default useAnalysis;
