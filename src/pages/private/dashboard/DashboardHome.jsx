import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Divider, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { setAlert, setLoading } from "../../../redux/configSlice";
import MuiTypography from "../../../components/common/MuiTypography";
import ProfileStatus from "../../../components/common/ProfileStatus";
import {
  getAllAdUrl,
  getMyAdUrl,
  fetchIPLocation,
  getMyContractsUrl,
  searchTalents,
} from "../../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../../utils/constants/config";
import OverviewSkeleton from "../../../components/skeleton/OverviewSkeleton";
import SearchBox from "../../../components/appBar/SearchBox";
import ProffecionalCards from "../../../components/professionals/ProffecionalCards";
import { USER_TYPES } from "../../../utils/constants/login";
import ProfessionalProfilePopup from "../../../components/professionals/ProfessionalProfilePopup";
import { IP_LOCAL_DATA, USER_DATA } from "../../../utils/constants/auth";
import { setMyContractList } from "../../../redux/jobSlice";
import {
  getLocalStorage,
  setLocalStorage,
} from "../../../utils/localStorageUtils";
import Overview from "../Overview";
import { useMediaQuery } from "@mui/material";
import MobileDashboard from "../MobileDashboard";
import useDashboardCards from "../../../hooks/useDashboardCards";
import DashboardAdsSection from "./DashboardAdsSection";

function Dashboard() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = JSON?.parse(getLocalStorage(USER_DATA));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const allowedUserTypes = ["contractor", "client", "admin", "specialist"];
  const { profileData, veriffStatus } = useSelector((state) => state.profile);
  const { loading } = useSelector((state) => state.config);

  const [isAdLoading, setIsAdLoading] = useState(false);
  const [hasOverviewData, setHasOverviewData] = useState(false);

  const [webinarAdList, setWebinarAdList] = useState([]);

  const [greeting, setGreeting] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);

  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rows, setRows] = useState([]);
  const [loadingMyCards, setLoadingMyCards] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // NEW: Track if data has loaded to distinguish between loading and empty states
  const [dataLoadStates, setDataLoadStates] = useState({
    overview: { loaded: false, hasData: false },
    ads: { loaded: false, hasData: false },
    webinars: { loaded: false, hasData: false },
  });

  const handleAdsLoaded = useCallback((hasData) => {
    setDataLoadStates((prev) => ({
      ...prev,
      ads: { loaded: true, hasData },
    }));
  }, []);

  // Refs to track swiper instances for each ad type

  // UPDATED: Enhanced callback to track both loading state and data availability
  const handleOverviewDataChange = useCallback((hasData) => {
    setHasOverviewData(hasData);
    setDataLoadStates((prev) => ({
      ...prev,
      overview: { loaded: true, hasData },
    }));
  }, []);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Backend search when debouncedSearchQuery changes
  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setLoadingSearch(false);
        return;
      }

      setLoadingSearch(true);
      try {
        const response = await searchTalents({
          search: debouncedSearchQuery,
          userType: ['contractor', 'specialist'],
          page: 1,
          pageSize: 50, // Get more results for search
        });
        
        setSearchResults(response.data.data || []);
        console.log('Search results:', response.data.data?.length || 0);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }

    performSearch();
  }, [debouncedSearchQuery]);

  const [cards] = useDashboardCards(
    profileData?.userType
    // handleMyLearningClick
  );

  const fetchInitialData = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const { data: webinarRes } = await getMyAdUrl();
      const webinarAds =
        webinarRes?.data?.filter(
          (ad) =>
            ad.adType === "productIntroduction" ||
            ad.adType === "training" ||
            ad.adType === "promotionalWorkshop"
        ) || [];
      setWebinarAdList(webinarAds);
      // NEW: Update webinar load state
      setDataLoadStates((prev) => ({
        ...prev,
        webinars: { loaded: true, hasData: webinarAds.length > 0 },
      }));
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchInitialData();
    };

    run();
  }, [fetchInitialData]);
  
   // --- Reusable function to set the greeting according to the time ---
const setGreetingByHour = (hour, source = "unknown") => {

  console.log(`Assigning greeting: hour=${hour} (source: ${source})`);

  if (hour >= 5 && hour < 12) {
      setGreeting(t("greeting.morning"));
    } else if (hour >= 12 && hour < 17) {
      setGreeting(t("greeting.afternoon"));
    } else if (hour >= 17 && hour < 22) {
      setGreeting(t("greeting.evening"));
    } else {
      setGreeting(t("greeting.night"));
    }
  };
 

const getLocalIpData = async () => {
  try {
    console.log("Trying to get location by IP...");
    const responseData = await fetchIPLocation();

    if (responseData?.timezone) {
      console.log("IP location data obtained:", {
        city: responseData.city,
        country: responseData.country_name,
        timezone: responseData.timezone,
        ip: responseData.ip,
      });

      setLocalStorage(IP_LOCAL_DATA, responseData, true);

      const timeZone = responseData.timezone;
      const timeInZone = new Intl.DateTimeFormat("en", {
        hour: "numeric",
        hour12: false,
        timeZone,
      }).format(new Date());

      const hour = parseInt(timeInZone, 10);
      console.log(`Time in ${timeZone}: ${hour}`);

      setGreetingByHour(hour, "IP/timezone"); 
    } else {
      // If the API doesn't return a timezone, use the local time
      console.warn("No timezone received. Using device local time.");
      const hour = new Date().getHours();
      setGreetingByHour(hour, "local/device");
    }
  } catch (error) {
    // If there's an error, use the local time
    console.error("Error obtaining location by IP:", error);
    const hour = new Date().getHours();
    setGreetingByHour(hour, "fallback/error");
  }
};

  const fetchMyContractJobs = useCallback(async () => {
    try {
      setLoadingMyCards(true);
      const { data: res } = await getMyContractsUrl(paginationModel);

      const resData = res.data;
      setTotalRecords(res.meta.totalRecords);
      const filterData = resData.filter((item) => item?.state !== "completed");
      setRows(filterData);
      dispatch(setMyContractList(resData));
      if (resData.length === res.meta.totalRecords) {
        setHasMoreData(false);
      }
      // NEW: Update overview data availability after processing
      const hasData = filterData.length > 0;
      setHasOverviewData(hasData);
      setDataLoadStates((prev) => ({
        ...prev,
        overview: { loaded: true, hasData },
      }));
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
      // NEW: Mark as loaded even on error
      setDataLoadStates((prev) => ({
        ...prev,
        overview: { loaded: true, hasData: false },
      }));
    } finally {
      dispatch(setLoading(false));
      setLoadingMyCards(false);
    }
  }, [paginationModel]);

  useEffect(() => {
    getLocalIpData();
    fetchMyContractJobs();
  }, [fetchMyContractJobs]);


  // Remove old displayResults - now using dedicated states

  // NEW: Helper function to check if any section has data
  const hasAnySectionWithData = () => {
    return (
      dataLoadStates.overview.hasData ||
      dataLoadStates.ads.hasData ||
      dataLoadStates.webinars.hasData
    );
  };
  // NEW: Helper function to check if all sections have loaded
  const hasAllSectionsLoaded = () => {
    return (
      dataLoadStates.overview.loaded &&
      dataLoadStates.ads.loaded &&
      dataLoadStates.webinars.loaded
    );
  };

  const shouldDisplayAds = useMemo(() => {
    // If user is not allowed to see overview, ads should be displayed immediately
    if (!allowedUserTypes.includes(user?.user?.userType)) return true;
    // Otherwise, wait for overview to load
    return dataLoadStates.overview.loaded;
  }, [user, dataLoadStates.overview]);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        {!veriffStatus && (
          <ProfileStatus
            status={profileData.status}
            isVerified={profileData.isVerified}
          />
        )}
      </Box>

      {/* MOBILE DASHBOARD */}
      {isMobile && (
        <MobileDashboard
          profileData={profileData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cards={cards}
          greeting={greeting}
          allowedUserTypes={allowedUserTypes}
          user={user}
        />
      )}

      {/* PROFESSIONAL SEARCH (ALL SIZES) */}
      {!isMobile && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            {/* Only show greeting and name if greeting has real value */}
            {greeting ? (
              <MuiTypography
                variant="h1"
                sx={{ fontWeight: 500, lineHeight: 1.6, mb: 0 }}
              >
                {`${greeting}, ${profileData?.firstName || "User"}!`}
              </MuiTypography>
            ) : (
              <MuiTypography
                variant="h1"
                sx={{ fontWeight: 500, lineHeight: 1.6, mb: 0 }}
              >
              {/* Loader or empty while waiting for API time */}
              </MuiTypography>
            )}
            <Box sx={{ minWidth: 200, maxWidth: 400, width: "100%" }}>
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t("milestone.search_talent")}
              />
            </Box>
          </Box>
          

          {/* Search Results */}
          {searchQuery && (
            <Box sx={{ mt: 2 }}>
              <MuiTypography variant="h3" sx={{ mb: 2 }}>
                {t("dashboard.search_results", "Search Results")}
                {!loadingSearch && searchResults.length > 0 && ` (${searchResults.length})`}
              </MuiTypography>
              
              {loadingSearch && (
                <MuiTypography>Searching...</MuiTypography>
              )}
              
              {!loadingSearch && searchResults.length === 0 && debouncedSearchQuery && (
                <MuiTypography sx={{ color: "text.secondary", fontStyle: "italic" }}>
                  No professionals found for "{debouncedSearchQuery}"
                </MuiTypography>
              )}
              
              {!loadingSearch && searchResults.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                    gap: "24px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  {searchResults.map((user) => (
                    <Box key={user.id} sx={{ minWidth: 0, display: "flex" }}>
                      <ProffecionalCards
                        profile={user}
                        onClick={() => {
                          setSelectedUser(user);
                          setDialogOpen(true);
                        }}
                        cardWidth="100%"
                        showCompletionBadge={false}
                        showVerificationBadge={true}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
          
          {/* Professional Profile Popup */}
          <ProfessionalProfilePopup
            open={dialogOpen}
            user={selectedUser}
            onClose={() => setDialogOpen(false)}
          />
        </>
      )}

      {/* CONDITIONAL OVERVIEW SECTION - Only show if user type is allowed AND has data */}
      {allowedUserTypes.includes(user?.user?.userType) && (
        <>
          {dataLoadStates.overview.loaded ? (
            dataLoadStates.overview.hasData && (
              <Box sx={{ height: "100%", my: 2.5 }}>
                <MuiTypography variant="h2" sx={{ mb: 0 }}>
                  {t("overview.overview")}
                </MuiTypography>
                <Divider sx={{ my: 2.5 }} />
                <Overview
                  hasMoreData={hasMoreData}
                  loadingMyCards={loadingMyCards}
                  rows={rows}
                  setPaginationModel={setPaginationModel}
                  totalRecords={totalRecords}
                  paginationModel={paginationModel}
                  setRows={setRows}
                  setHasMoreData={setHasMoreData}
                  onOverviewDataChange={handleOverviewDataChange}
                />
              </Box>
            )
          ) : (
            <OverviewSkeleton />
          )}
        </>
      )}

      {/* CONDITIONAL AD SECTIONS - Only show loading or sections with data */}
      <DashboardAdsSection
        isAdLoading={isAdLoading}
        previousSectionLoaded={shouldDisplayAds}
        dataLoadStates={dataLoadStates}
        onAdsLoaded={handleAdsLoaded}
      />

      {/* NEW: Show message when all sections have loaded but no data is available */}
      {hasAllSectionsLoaded() && !hasAnySectionWithData() && !searchQuery && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <MuiTypography variant="h3" sx={{ mb: 2 }}>
            {t("dashboard.no_content_title", "Welcome to your dashboard!")}
          </MuiTypography>
          <MuiTypography variant="body1">
            {t(
              "dashboard.no_content_message",
              "Check back later for new content and updates."
            )}
          </MuiTypography>
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;
