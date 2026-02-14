// Enhanced Price Calculator Component - Compact and Well-Aligned
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Info as InfoIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { debounce } from "lodash";
import {
  getUserCountsUrl,
  getProfessionalTypesUrl,
} from "../../apis/apiEndPoints";

const EnhancedPriceCalculator = ({
  adField,
  resultAdsFee,
  currency,
  currentUserCurrency,
  convertedTotal,
  userCountry,
  onFeeCalculate,
  t,
}) => {
  const [userCounts, setUserCounts] = useState({
    total: 0,
    byType: {},
    byProfession: {},
    loading: false,
    error: null,
  });
const [selectedCountryFilter, setSelectedCountryFilter] = useState(userCountry || 'all');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [showCountryFilter, setShowCountryFilter] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  const lastRequestRef = useRef(null);

  // Get current values from adField
  const durationField = adField.find((f) => f.id === "duration");
  const audienceField = adField.find((f) => f.id === "audience");
  const professionalTypeField = adField.find(
    (f) => f.id === "professionalType"
  );

  const duration = durationField?.value;
  const startDate = durationField?.child?.data?.[0]?.value;
  const endDate = durationField?.child?.data?.[1]?.value;
  const selectedAudience = audienceField?.value || [];
  const selectedProfessions = professionalTypeField?.value || [];

  // Check if only clients are selected
  const isClientOnly = useMemo(() => {
    return selectedAudience.length === 1 && selectedAudience.includes("client");
  }, [selectedAudience]);

  // Calculate number of days automatically
  const numberOfDays = useMemo(() => {
    // If duration is NOT "pickADate", use the duration value directly and ignore date picker
    if (duration && duration !== "pickADate") {
      switch (duration) {
        case "oneDay":
          return 1;
        case "oneWeek":
          return 7;
        case "oneMonth":
          return 30;
        default:
          return 1;
      }
    }

    // Only use date picker values when "pickADate" is selected
    if (duration === "pickADate" && startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      return Math.max(1, end.diff(start, "day") + 1);
    }

    // Default fallback
    if (duration === "pickADate") {
      return 0; // Show 0 to indicate dates need to be selected
    }

    return 1; // Default to 1 day
  }, [startDate, endDate, duration]);

  // Calculate reach (number of professional types selected)
  const reach = useMemo(() => {
    if (isClientOnly) {
      return 1;
    }
    return selectedProfessions.length || 0;
  }, [selectedProfessions, isClientOnly]);

  // Create a stable request signature to prevent duplicate calls
  const requestSignature = useMemo(() => {
    if (isClientOnly) {
      return JSON.stringify({
        audienceTypes: ["client"],
        professionalTypes: [],
        country: selectedCountryFilter,
      });
    }

    const sortedAudience = [...selectedAudience].sort();
    const sortedProfessions = [...selectedProfessions].sort();

    return JSON.stringify({
      audienceTypes: sortedAudience,
      professionalTypes: sortedProfessions,
      country: selectedCountryFilter,
    });
  }, [
    selectedAudience,
    selectedProfessions,
    selectedCountryFilter,
    isClientOnly,
  ]);

  // Function to load countries on demand
  const loadCountries = useCallback(async () => {
    if (availableCountries.length > 0) {
      setShowCountryFilter(true);
      return;
    }

    setCountriesLoading(true);
    try {
      // Make a simple request to get countries
      const payload = {
        audienceTypes:
          selectedAudience.length > 0 ? selectedAudience : ["client"],
        country: undefined, // Get all countries
      };

      const response = await getUserCountsUrl(payload);
      const data = response.data;

      if (data.availableCountries) {
        setAvailableCountries(data.availableCountries);
        setShowCountryFilter(true);
      }
    } catch (error) {
      console.error("Error loading countries:", error);
    } finally {
      setCountriesLoading(false);
    }
  }, [selectedAudience, availableCountries.length]);

  // Function to fetch user counts
  const fetchUserCounts = useCallback(
    async (audienceTypes, professionalTypes, country) => {
      if (!audienceTypes || audienceTypes.length === 0) {
        if (isMountedRef.current) {
          setUserCounts((prev) => ({
            ...prev,
            total: 0,
            byType: {},
            byProfession: {},
            loading: false,
          }));
        }
        return;
      }

      const sortedAudience = [...audienceTypes].sort();
      const sortedProfessions = [...professionalTypes].sort();

      const currentSignature = JSON.stringify({
        audienceTypes: sortedAudience,
        professionalTypes: sortedProfessions,
        country,
      });

      if (lastRequestRef.current === currentSignature) {
        return;
      }

      lastRequestRef.current = currentSignature;

      if (isMountedRef.current) {
        setUserCounts((prev) => ({ ...prev, loading: true, error: null }));
      }

      try {
        const isClientOnlyRequest =
          audienceTypes.length === 1 && audienceTypes.includes("client");

        const payload = {
          audienceTypes,
          professionalTypes: isClientOnlyRequest
            ? undefined
            : professionalTypes.length > 0
            ? professionalTypes
            : undefined,
          country: country !== "all" ? country : undefined,
        };

        const response = await getUserCountsUrl(payload);
        const data = response.data;

        if (isMountedRef.current) {
          setUserCounts((prev) => ({
            ...prev,
            total: data.total || 0,
            byType: data.byType || {},
            byProfession: data.byProfession || {},
            loading: false,
          }));

          // Update countries if we don't have them yet
          if (data.availableCountries && availableCountries.length === 0) {
            setAvailableCountries(data.availableCountries);
          }
        }
      } catch (error) {
        console.error("Error fetching user counts:", error);
        if (isMountedRef.current) {
          setUserCounts((prev) => ({
            ...prev,
            loading: false,
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch user counts",
          }));
        }
      }
    },
    [availableCountries.length]
  );

  // Debounced version of fetch function
  const debouncedFetchUserCounts = useMemo(
    () => debounce(fetchUserCounts, 1000),
    [fetchUserCounts]
  );

  // Single effect to handle all user count fetching
  useEffect(() => {
    // Only fetch if we have audience selected and valid duration/dates
    const shouldFetchCounts = selectedAudience.length > 0 && (
      // For non-pickADate options, just need duration
      (duration && duration !== "pickADate") ||
      // For pickADate, need both start and end dates
      (duration === "pickADate" && startDate && endDate)
    );

    if (shouldFetchCounts) {
      if (isClientOnly) {
        debouncedFetchUserCounts(["client"], [], selectedCountryFilter);
      } else {
        debouncedFetchUserCounts(
          selectedAudience,
          selectedProfessions,
          selectedCountryFilter
        );
      }
    } else {
      // Clear loading state and reset counts when conditions aren't met
      setUserCounts((prev) => ({
        ...prev,
        total: 0,
        byType: {},
        byProfession: {},
        loading: false,
        error: null,
      }));
      // Cancel any pending API calls
      debouncedFetchUserCounts.cancel();
    }

    return () => {
      debouncedFetchUserCounts.cancel();
    };
  }, [
    requestSignature,
    debouncedFetchUserCounts,
    selectedAudience.length,
    isClientOnly,
    duration,
    startDate,
    endDate,
  ]);

  // Auto-calculate fees when days or reach changes
  useEffect(() => {
    if (numberOfDays > 0 && reach > 0 && onFeeCalculate) {
      onFeeCalculate({
        numberOfDays,
        reach,
        startDate,
        endDate,
      });
    }
  }, [numberOfDays, reach, startDate, endDate, onFeeCalculate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // FIXME user counts not working when component is unmounted
      // isMountedRef.current = false;
      debouncedFetchUserCounts.cancel();
    };
  }, [debouncedFetchUserCounts]);

  // Handle country filter change
  const handleCountryFilterChange = useCallback((event) => {
    setSelectedCountryFilter(event.target.value);
  }, []);

  // Don't show calculator if no audience is selected
  if (!selectedAudience.length) {
    return (
      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        {t("ad.select_audience_to_see_calculator", "Select audience to see price calculator")}
      </Alert>
    );
  }

  // Don't show calculator if duration is not properly selected
  if (!duration || (duration === "pickADate" && (!startDate || !endDate))) {
    return (
      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        {t("ad.select_duration_to_see_calculator", "Select duration and dates to see price calculator")}
      </Alert>
    );
  }

  const totalCost =
    (resultAdsFee?.fees || 0) + (resultAdsFee?.servicesFees || 0);

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
        {t("ad.price_calculator")}
      </Typography>

      {/* Compact Card */}
      <Card variant="outlined" sx={{ p: 2 }}>
        <CardContent sx={{ p: "0 !important" }}>
          {/* Top Section - User Count and Country Filter */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              {userCounts.loading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">
                    {t("ad.loading_user_counts")}
                  </Typography>
                </Box>
              ) : userCounts.error ? (
                <Typography variant="body2" color="error">
                  {userCounts.error}
                </Typography>
              ) : (
                <Box>
                  <Typography
                    variant="h5"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    {userCounts.total.toLocaleString()} {t("ad.total_users")}
                  </Typography>
                  {selectedCountryFilter !== "all" && (
                    <Typography variant="caption" color="text.secondary">
                      in {selectedCountryFilter}
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    countriesLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <FilterIcon />
                    )
                  }
                  onClick={loadCountries}
                  disabled={countriesLoading}
                >
                  {t("ad.filter_by_country")}
                </Button>

                {showDetails && (
                  <IconButton
                    size="small"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Country Filter Dropdown */}
          <Collapse in={showCountryFilter}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>{t("ad.select_country")}</InputLabel>
              <Select
                value={selectedCountryFilter}
                label={t("ad.select_country")}
                onChange={handleCountryFilterChange}
              >
                <MenuItem value="all">{t("ad.all_countries")}</MenuItem>
                {availableCountries.map((country) => (
                  <MenuItem
                    key={`${country.code}-${country.name}`}
                    value={country.name}
                  >
                    {country.name} ({country.userCount.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Collapse>

          {/* Main Content - Calculation and Cost */}
          <Grid container spacing={2} alignItems="center">
            {/* Left side - Compact Calculation */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {t("ad.ad_duration")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {numberOfDays}{" "}
                    {numberOfDays === 1 ? t("ad.day") : t("ad.days")}
                  </Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {t("ad.reach")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {userCounts.total.toLocaleString()} {userCounts.total > 1 ? t("ad.people") : t("ad.person")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {isClientOnly
                      ? t("ad.client_type_single")
                      : `${reach} ${t("ad.profession_types")}`}
                  </Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {t("ad.base_fee")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    ${resultAdsFee?.fees || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Right side - Compact Total Cost */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  p: 2,
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ opacity: 0.9 }}
                >
                  {t("ad.total_cost")}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", lineHeight: 1.2 }}
                >
                  ${totalCost}
                </Typography>
                {currency && convertedTotal && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ opacity: 0.9 }}
                  >
                    {convertedTotal} {currency}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Expandable Details */}
          {Object.keys(userCounts.byType).length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                variant="text"
                onClick={() => setShowDetails(!showDetails)}
                endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showDetails ? t("ad.hide_details") : t("ad.show_breakdown")}
              </Button>

              <Collapse in={showDetails}>
                <Box sx={{ mt: 1 }}>
                  {/* Audience Type Breakdown */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("ad.by_audience_type")}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                    {Object.entries(userCounts.byType).map(([type, count]) => (
                      <Chip
                        key={type}
                        label={`${t(
                          `ad.audience.${type}`
                        )}: ${count.toLocaleString()}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  {/* Professional Types Breakdown */}
                  {!isClientOnly &&
                    Object.keys(userCounts.byProfession).length > 0 && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          gutterBottom
                        >
                          {t("ad.by_profession")}
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {Object.entries(userCounts.byProfession)
                            .slice(0, 3)
                            .map(([profession, count]) => (
                              <Chip
                                key={profession}
                                label={`${profession}: ${count.toLocaleString()}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                        </Box>
                      </Box>
                    )}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Client Only Message */}
          {isClientOnly && (
            <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>
              <Typography variant="caption">
                {t("ad.clients_single_category_message")}
              </Typography>
            </Alert>
          )}

          {/* Warning for no users */}
          {!userCounts.loading &&
            userCounts.total === 0 &&
            selectedAudience.length > 0 && (
              <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
                <Typography variant="caption">
                  {t("ad.no_users_adjust_criteria")}
                </Typography>
              </Alert>
            )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EnhancedPriceCalculator;
