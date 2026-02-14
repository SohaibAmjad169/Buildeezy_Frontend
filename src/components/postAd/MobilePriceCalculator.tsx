import {
  Typography,
  CircularProgress,
  Button,
  Collapse,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";
import React from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useMemo } from "react";
import { useRef } from "react";
import { getUserCountsUrl } from "../../apis/apiEndPoints";
import dayjs from "dayjs";

const MobilePriceCalculator = ({
  field,
  isAdmin,
  selectedAudience,
  values,
  selectedProfessions,
  duration,
  startDate,
  endDate,
  resultAdsFee,
  currency,
  convertedTotal
}) => {
  const { t } = useTranslation();
  const { profileData } = useSelector((state: any) => state.profile);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState(
    profileData?.country?.name || "all"
  );
  const [availableCountries, setAvailableCountries] = useState<
    { code: string; name: string; userCount: number }[]
  >([]);
  const [showCountryFilter, setShowCountryFilter] = useState(false);
  // Enhanced price calculator states
  const [userCounts, setUserCounts] = useState<{
    total: number;
    byType: Record<string, number>;
    byProfession: Record<string, number>;
    loading: boolean;
    error: string | null;
  }>({
    total: 0,
    byType: {},
    byProfession: {},
    loading: false,
    error: null,
  });

  const [showBreakdown, setShowBreakdown] = useState(false);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  const lastRequestRef = useRef<string | null>(null);

  // Check if only clients are selected
  const isClientOnly = useMemo(() => {
    return selectedAudience.length === 1 && selectedAudience.includes("client");
  }, [selectedAudience]);

  // Create a stable request signature
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

  const numberOfDays = useMemo(() => {
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

    if (duration === "pickADate" && startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      return Math.max(1, end.diff(start, "day") + 1);
    }

    if (duration === "pickADate") {
      return 0;
    }

    return 1;
  }, [startDate, endDate, duration]);

  // Function to load countries on demand
  const loadCountries = useCallback(async () => {
    if (availableCountries.length > 0) {
      setShowCountryFilter(true);
      return;
    }

    setCountriesLoading(true);
    try {
      const payload = {
        audienceTypes:
          selectedAudience.length > 0 ? selectedAudience : ["client"],
        country: undefined,
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

  // Calculate reach (number of professional types selected)
  const reach = useMemo(() => {
    if (isClientOnly) {
      return 1;
    }
    return selectedProfessions.length || 0;
  }, [selectedProfessions, isClientOnly]);

  // Debounced version of fetch function
  const debouncedFetchUserCounts = useMemo(
    () => debounce(fetchUserCounts, 1000),
    [fetchUserCounts]
  );

  // Handle country filter change
  const handleCountryFilterChange = useCallback((event) => {
    setSelectedCountryFilter(event.target.value);
  }, []);

  // Effect to handle user count fetching
  useEffect(() => {
    // Don't fetch counts for learning solutions in production
    if (
      values.adType === "learningSolution" &&
      (import.meta as any).env.VITE_NODE_ENV === "production"
    ) {
      setUserCounts((prev) => ({
        ...prev,
        total: 0,
        byType: {},
        byProfession: {},
        loading: false,
        error: null,
      }));
      (debouncedFetchUserCounts as any).cancel();
      return;
    }

    // Only fetch if price calculator should be shown
    const shouldShowPriceCalculator =
      !(
        values.adType === "learningSolution" &&
        (import.meta as any).env.VITE_NODE_ENV === "production"
      ) &&
      (values.adType !== "learningSolution" ||
        (values.adType === "learningSolution" &&
          (import.meta as any).env.VITE_NODE_ENV !== "production" &&
          values.displayOnDashboard === "yes"));

    if (!shouldShowPriceCalculator) {
      setUserCounts((prev) => ({
        ...prev,
        total: 0,
        byType: {},
        byProfession: {},
        loading: false,
        error: null,
      }));
      (debouncedFetchUserCounts as any).cancel();
      return;
    }

    if (selectedAudience.length > 0) {
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
      setUserCounts((prev) => ({
        ...prev,
        total: 0,
        byType: {},
        byProfession: {},
        loading: false,
        error: null,
      }));
    }

    return () => {
      (debouncedFetchUserCounts as any).cancel();
    };
  }, [
    requestSignature,
    debouncedFetchUserCounts,
    selectedAudience.length,
    isClientOnly,
    values.adType,
    values.displayOnDashboard,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // FIXME user counts not working when component is unmounted
      // isMountedRef.current = false;
      (debouncedFetchUserCounts as any).cancel();
    };
  }, [debouncedFetchUserCounts]);

  // Don't show calculator if learning solution is in production
  if(values.adType === "learningSolution" && (import.meta as any).env.VITE_NODE_ENV === "production") return null;

  return (
    field?.id === "duration" &&
    !isAdmin &&
    selectedAudience.length > 0 &&
    (values.adType !== "learningSolution" ||
      (values.adType === "learningSolution" && (import.meta as any).env.VITE_NODE_ENV !== "production" && values.displayOnDashboard === "yes")
    ) && (
      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="body1" fontWeight="bold" mb={2}>
          {t("ad.price_calculator")}
        </Typography>

        {/* User Count and Country Filter */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            {userCounts.loading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="body2">{t("ad.loading_user_counts")}</Typography>
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
                    {t("ad.in_country", { country: selectedCountryFilter })}
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

        {/* Main Content Grid */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {/* Compact Calculation Display */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("ad.advertisement_duration")}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {numberOfDays} {numberOfDays === 1 ? t("ad.day") : t("ad.days")}
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
                <Typography variant="h6" fontWeight="bold">
                  {userCounts.total.toLocaleString()} {userCounts.total > 1 ? t("ad.people") : t("ad.person")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {isClientOnly ? t("ad.client_type_single") : `${reach} ${t("ad.profession_types")}`}
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
                <Typography variant="h6" fontWeight="bold">
                  ${resultAdsFee?.fees || 0}
                </Typography>
              </Grid>
            </Grid>

            {/* Show Breakdown Button */}
            <Button
              onClick={() => setShowBreakdown(!showBreakdown)}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontSize: "0.875rem",
                mb: 1,
                p: 0,
                minHeight: "auto",
              }}
              endIcon={showBreakdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {t("ad.show_breakdown")}
            </Button>

            {/* Breakdown Details */}
            <Collapse in={showBreakdown}>
              <Box sx={{ mb: 2 }}>
                {Object.keys(userCounts.byType).length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      {t("ad.by_audience_type")}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                      {Object.entries(userCounts.byType).map(
                        ([type, count]) => (
                          <Chip
                            key={type}
                            label={`${type}: ${count.toLocaleString()}`}
                            size="small"
                            variant="outlined"
                          />
                        )
                      )}
                    </Box>
                  </Box>
                )}

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
          </Grid>

          {/* Total Cost Box */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                bgcolor: "#719C40",
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
                ${(resultAdsFee?.fees || 0) + (resultAdsFee?.servicesFees || 0)}
              </Typography>
              {currency && currency !== "USD" && convertedTotal && (
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

        {/* Client Only Message */}
        {isClientOnly && (
          <Alert severity="info" sx={{ mt: 2, py: 0.5 }}>
            <Typography variant="caption">
              {t("ad.clients_single_category_message")}
            </Typography>
          </Alert>
        )}

        {/* Warning for no users */}
        {!userCounts.loading &&
          userCounts.total === 0 &&
          selectedAudience.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2, py: 0.5 }}>
              <Typography variant="caption">
                {t("ad.no_users_adjust_criteria")}
              </Typography>
            </Alert>
          )}
      </Box>
    )
  );
};

export default MobilePriceCalculator;
