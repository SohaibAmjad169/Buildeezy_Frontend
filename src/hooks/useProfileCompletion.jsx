import { useState, useEffect } from 'react';
import { getProfileCompletionUrl } from '../apis/apiEndPoints';

// Custom hook for managing profile completion percentage
function useProfileCompletion() {
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompletion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProfileCompletionUrl();
      const percentage = response?.data?.data?.profileCompletionPercentage || 0;
      setCompletion(percentage);
      return percentage;
    } catch (err) {
      console.error('Error fetching profile completion:', err);
      setError(err.message || 'Failed to fetch profile completion');
      return 0;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on hook initialization
  useEffect(() => {
    fetchCompletion();
  }, []);

  return {
    completion,
    loading,
    error,
    refetch: fetchCompletion
  };
}

export default useProfileCompletion;