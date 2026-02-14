import { useDispatch, useSelector } from "react-redux";
import { setAlert, setCities, setLoading } from "../redux/configSlice";
import { ALERT_TYPE } from "../utils/constants/config";
import { getCity } from "../apis/apiEndPoints";

// Cache to store cities by country to avoid redundant API calls
const citiesCache = new Map();

function useCity() {
  const dispatch = useDispatch();
  const { cities: reduxCities } = useSelector((state) => state.config);

  const getCities = async (country, forceRefresh = false) => {
    // Return empty array if no country provided
    if (!country) {
      return [];
    }

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh && citiesCache.has(country)) {
      const cachedCities = citiesCache.get(country);
      // Update Redux state with cached data if needed
      if (JSON.stringify(reduxCities) !== JSON.stringify(cachedCities)) {
        dispatch(setCities(cachedCities));
      }
      return cachedCities;
    }

    try {
      dispatch(setLoading(true));
      const response = await getCity(country);
      const cities = response.data.data || [];
      
      // Cache the result
      citiesCache.set(country, cities);
      
      // Update Redux state
      dispatch(setCities(cities));
      
      return cities;
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
  // Clear cache for a specific country or all countries
  const clearCitiesCache = (country = null) => {
    if (country) {
      citiesCache.delete(country);
    } else {
      citiesCache.clear();
    }
  };

  // Get cached cities without API call
  const getCachedCities = (country) => {
    return citiesCache.get(country) || [];
  };

  return { getCities, clearCitiesCache, getCachedCities };
}

export default useCity;
