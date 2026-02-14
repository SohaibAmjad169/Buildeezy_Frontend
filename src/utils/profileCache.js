/**
 * Profile data caching utilities for improved performance
 * Caches profile data in sessionStorage to reduce API calls
 */

const CACHE_KEYS = {
  PROFILE_DATA: 'profile_cache_',
  SUGGESTED_PROFILES: 'suggested_profiles_cache',
  PORTFOLIO_DATA: 'portfolio_cache_',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached profile data if available and not expired
 */
export const getCachedProfileData = (userId) => {
  try {
    const cacheKey = CACHE_KEYS.PROFILE_DATA + userId;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;
    
    if (isExpired) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Error reading profile cache:', error);
    return null;
  }
};

/**
 * Cache profile data
 */
export const setCachedProfileData = (userId, data) => {
  try {
    const cacheKey = CACHE_KEYS.PROFILE_DATA + userId;
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error writing profile cache:', error);
  }
};

/**
 * Get cached suggested profiles
 */
export const getCachedSuggestedProfiles = (params = {}) => {
  try {
    const cacheKey = CACHE_KEYS.SUGGESTED_PROFILES + JSON.stringify(params);
    const cached = sessionStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;
    
    if (isExpired) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Error reading suggested profiles cache:', error);
    return null;
  }
};

/**
 * Cache suggested profiles
 */
export const setCachedSuggestedProfiles = (params, data) => {
  try {
    const cacheKey = CACHE_KEYS.SUGGESTED_PROFILES + JSON.stringify(params);
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error writing suggested profiles cache:', error);
  }
};

/**
 * Clear all profile caches
 */
export const clearProfileCache = (userId = null) => {
  try {
    if (userId) {
      // Clear specific user cache
      const profileKey = CACHE_KEYS.PROFILE_DATA + userId;
      const portfolioKey = CACHE_KEYS.PORTFOLIO_DATA + userId;
      sessionStorage.removeItem(profileKey);
      sessionStorage.removeItem(portfolioKey);
    } else {
      // Clear all profile related caches
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(CACHE_KEYS.PROFILE_DATA) || 
            key.startsWith(CACHE_KEYS.PORTFOLIO_DATA) ||
            key.startsWith(CACHE_KEYS.SUGGESTED_PROFILES)) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.warn('Error clearing profile cache:', error);
  }
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => {
  const stats = {
    profileCaches: 0,
    portfolioCaches: 0,
    suggestedProfilesCaches: 0,
    totalSize: 0,
  };
  
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(CACHE_KEYS.PROFILE_DATA)) {
        stats.profileCaches++;
      } else if (key.startsWith(CACHE_KEYS.PORTFOLIO_DATA)) {
        stats.portfolioCaches++;
      } else if (key.startsWith(CACHE_KEYS.SUGGESTED_PROFILES)) {
        stats.suggestedProfilesCaches++;
      }
      
      stats.totalSize += sessionStorage.getItem(key)?.length || 0;
    });
    
    // Convert size to KB
    stats.totalSizeKB = Math.round(stats.totalSize / 1024 * 100) / 100;
    
  } catch (error) {
    console.warn('Error getting cache stats:', error);
  }
  
  return stats;
};