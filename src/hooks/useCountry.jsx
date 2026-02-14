import { useDispatch, useSelector } from "react-redux";
import { setAlert, setCountries, setLoading } from "../redux/configSlice";
import { ALERT_TYPE } from "../utils/constants/config";
import { getCountry } from "../apis/apiEndPoints";

// Cache for countries (they rarely change)
let countriesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function useCountry() {
  const dispatch = useDispatch();
  const { countries: reduxCountries } = useSelector((state) => state.config);

  const getCountries = async (forceRefresh = false) => {
    // Check cache first
    const now = Date.now();
    const isCacheValid = cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION;
    
    if (!forceRefresh && countriesCache && isCacheValid) {
      // Update Redux state with cached data if needed
      if (JSON.stringify(reduxCountries) !== JSON.stringify(countriesCache)) {
        dispatch(setCountries(countriesCache));
      }
      return countriesCache;
    }

    // Check if Redux already has data and cache is empty
    if (!forceRefresh && !countriesCache && reduxCountries.length > 0) {
      countriesCache = reduxCountries;
      cacheTimestamp = now;
      return reduxCountries;
    }

    try {
      dispatch(setLoading(true));
      const response = await getCountry();
      const countries = response.data.data || [];
      
      // Update cache
      countriesCache = countries;
      cacheTimestamp = now;
      
      // Update Redux state
      dispatch(setCountries(countries));
      
      return countries;
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Get cached countries without API call
  const getCachedCountries = () => {
    const now = Date.now();
    const isCacheValid = cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION;
    
    if (countriesCache && isCacheValid) {
      return countriesCache;
    }
    
    // Return Redux data if available
    return reduxCountries.length > 0 ? reduxCountries : [];
  };

  // Clear countries cache
  const clearCountriesCache = () => {
    countriesCache = null;
    cacheTimestamp = null;
  };

  return { getCountries, getCachedCountries, clearCountriesCache };
}

export default useCountry;
