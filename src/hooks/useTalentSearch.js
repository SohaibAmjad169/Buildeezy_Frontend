// hooks/useTalentSearch.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchTalents } from '../apis/apiEndPoints';
import { useDispatch } from 'react-redux';
import { setAlert } from '../redux/configSlice';
import { ALERT_TYPE } from '../utils/constants/config';

const useTalentSearch = () => {
  const dispatch = useDispatch();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Search parameters
  const [searchParams, setSearchParams] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    userType: ['contractor', 'specialist'],
    category: '',
    includeTempContractors: false
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef(null);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchParams.search);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchParams.search]);

  // Fetch talents function
  const fetchTalents = useCallback(async (params, append = false) => {
    try {
      setLoading(true);
      
      const response = await searchTalents(params);
      const { data, meta } = response.data;

      setProfessionals(prev => append ? [...prev, ...data] : data);
      setTotalRecords(meta.totalRecords);
      setTotalPages(meta.totalPages);
      setHasMore(meta.page < meta.totalPages);
      
      if (!initialized) {
        setInitialized(true);
      }
      
      return { data, meta };
    } catch (error) {
      console.error('Error fetching talents:', error);
      dispatch(setAlert({
        show: true,
        type: ALERT_TYPE.error,
        message: error.response?.data?.errors?.[0]?.detail || 'Failed to search talents'
      }));
      
      // Set empty results on error
      if (!append) {
        setProfessionals([]);
        setTotalRecords(0);
        setTotalPages(0);
        setHasMore(false);
      }
      
      if (!initialized) {
        setInitialized(true);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, initialized]);

  // Search effect - trigger when debounced search or other params change
  useEffect(() => {
    const searchWithDebouncedTerm = {
      ...searchParams,
      search: debouncedSearch,
      page: 1 // Reset to first page on new search
    };

    fetchTalents(searchWithDebouncedTerm, false);
  }, [debouncedSearch, searchParams.userType, searchParams.category, searchParams.includeTempContractors, fetchTalents]);

  // Update search parameters
  const updateSearch = useCallback((newSearch) => {
    setSearchParams(prev => ({
      ...prev,
      search: newSearch,
      page: 1 // Reset page on new search
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setSearchParams(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset page on filter change
    }));
  }, []);

  // Load more function for pagination
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    const nextPageParams = {
      ...searchParams,
      search: debouncedSearch,
      page: searchParams.page + 1
    };

    setSearchParams(prev => ({ ...prev, page: prev.page + 1 }));
    await fetchTalents(nextPageParams, true);
  }, [hasMore, loading, searchParams, debouncedSearch, fetchTalents]);

  // Reset search
  const resetSearch = useCallback(() => {
    setSearchParams({
      page: 1,
      pageSize: 20,
      search: '',
      userType: ['contractor', 'specialist'],
      category: '',
      includeTempContractors: false
    });
    setProfessionals([]);
    setTotalRecords(0);
    setTotalPages(0);
    setHasMore(false);
  }, []);

  // Initial fetch when hook is first used
  useEffect(() => {
    if (!initialized && searchParams.search === '') {
      fetchTalents(searchParams, false);
    }
  }, [initialized, searchParams, fetchTalents]);

  return {
    // Data
    professionals,
    loading,
    initialized,
    totalRecords,
    totalPages,
    hasMore,
    
    // Search params
    searchQuery: searchParams.search,
    currentFilters: {
      userType: searchParams.userType,
      category: searchParams.category,
      includeTempContractors: searchParams.includeTempContractors
    },
    
    // Actions
    updateSearch,
    updateFilters,
    loadMore,
    resetSearch,
    refetch: () => fetchTalents({ ...searchParams, search: debouncedSearch }, false)
  };
};

export default useTalentSearch;