// hooks/useImpressionTracking.js (Simplified version)
import { useCallback } from 'react';
import { postAdImpressionUrl } from '../apis/apiEndPoints';

const useImpressionTracking = () => {
  const trackImpression = useCallback(async (adId, onSuccess) => {
    try {
      console.log('🚀 Tracking impression for ad:', adId);
      
      // Make the API call first
      const response = await postAdImpressionUrl(adId);
      const data = response.data.data || response.data;
      
      console.log('📡 API Response:', data);
      
      if (!data.alreadyTracked) {
        console.log('✅ New impression tracked. Backend count:', data.impressionCount);
        // Update UI with backend count
        onSuccess?.(data.impressionCount);
      } else {
        console.log('⚠️ Already tracked, no update needed');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error tracking impression:', error);
      return { success: false, error };
    }
  }, []);

  return trackImpression;
};

export default useImpressionTracking;