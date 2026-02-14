// hooks/useAdAnalytics.js
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setAlert, setLoading } from "../redux/configSlice";
import { getAdAnalyticsUrl } from "../apis/apiEndPoints";
import { ALERT_TYPE } from "../utils/constants/config";

function useAdAnalytics() {
  const dispatch = useDispatch();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchAnalytics = useCallback(
    async (adId, options = {}) => {
      try {
        setAnalyticsLoading(true);
        const { startDate, endDate } = options;
        
        const params = {};
        if (startDate) {
          // Format date to YYYY-MM-DD
          params.startDate = startDate instanceof Date 
            ? startDate.toISOString().split('T')[0]
            : startDate;
        }
        if (endDate) {
          // Format date to YYYY-MM-DD
          params.endDate = endDate instanceof Date 
            ? endDate.toISOString().split('T')[0]
            : endDate;
        }

        const response = await getAdAnalyticsUrl(adId, params);
        const analyticsResult = response.data?.data?.attributes;
        
        setAnalyticsData(analyticsResult);
        return analyticsResult;
      } catch (err) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: err.message || "Failed to fetch analytics",
          })
        );
        throw err;
      } finally {
        setAnalyticsLoading(false);
      }
    },
    [dispatch]
  );

  const refreshAnalytics = useCallback(
    async (adId, dateRange = {}) => {
      return await fetchAnalytics(adId, dateRange);
    },
    [fetchAnalytics]
  );

  const clearAnalytics = useCallback(() => {
    setAnalyticsData(null);
  }, []);

  return { 
    analyticsData, 
    analyticsLoading, 
    fetchAnalytics, 
    refreshAnalytics,
    clearAnalytics 
  };
}

export default useAdAnalytics;