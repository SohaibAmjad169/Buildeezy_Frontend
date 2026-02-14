import { SetStateAction, useCallback, useState } from "react";
import { DASHBOARD_AD_TYPE_OPTIONS } from "../../../utils/constants/ad";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";
import { mapAdCategoryTitle } from "../../../utils/constants/ad";
import { Box, Divider } from "@mui/material";
import MuiTypography from "../../../components/common/MuiTypography";
import Slider from "../../../components/Slider";
import { SwiperSlide } from "swiper/react";
import LearningCard from "../../../components/learning/LearningCard";
import AdCard from "../../../components/myAds/AdCard";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { setAlert, setLoading } from "../../../redux/configSlice";
import { useRef } from "react";
import { getAllAdUrl, toggleLikeAdUrl, getSuggestedProfiles } from "../../../apis/apiEndPoints";
import ProffecionalCards from "../../../components/professionals/ProffecionalCards";
import ProfessionalProfilePopup from "../../../components/professionals/ProfessionalProfilePopup";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useEffect } from "react";
import { categorizeAds } from "../../../utils/common";

type DashboardAdsSectionProps = {
  isAdLoading: boolean;
  previousSectionLoaded: boolean;
  dataLoadStates: any;
  // setDataLoadStates: (value: SetStateAction<{[key in ('ads' | 'webinars' | 'overview')]: {loaded: boolean; hasData: boolean}}>) => void;
  onAdsLoaded: (hasData: boolean) => void;
};

const adTypes = [
  "learningSolution",
  "profile",
  "product",
  "promotional",
  "productIntroduction",
  "promotionalWorkshop",
  "training",
];

const pageSize = 8;

function DashboardAdsSection(props: DashboardAdsSectionProps) {
  const { isAdLoading, previousSectionLoaded, dataLoadStates, onAdsLoaded } =
    props;

  const [adList, setAdList] = useState({});
  const [savedAds, setSavedAds] = useState(() => {
    const saved = localStorage.getItem("savedLearningAds");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [likedAds, setLikedAds] = useState(new Set());
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State for professional profile modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Handle clicks for different types of profile cards
  const handleProfileCardClick = (item) => {
    console.log('Profile card clicked:', item); // Debug log
    
    if (item.type === 'suggested_profile' && item.isProfile && item.profileData) {
      // For suggested profiles, show modal
      setSelectedUser(item.profileData);
      setDialogOpen(true);
    } else if (item.adType === 'profile') {
      // For ads profile cards, try multiple navigation strategies
      const cleanId = item.id.replace('profile_', ''); // Remove prefix if it exists
      const targetId = item.originalId || cleanId;
      
      console.log('Navigating to ad view with ID:', targetId);
      
      try {
        // Try relative navigation first (like AdCard does)
        navigate(`view/${targetId}`, {
          state: {
            authorId: item.authorId,
            authorName: item.author ? `${item.author.firstName} ${item.author.lastName}` : ''
          }
        });
      } catch (error) {
        console.error('Navigation failed:', error);
        // Fallback: try absolute path
        navigate(`/dashboard/ads/view/${targetId}`);
      }
    }
  };

  const [adListByType, setAdListByType] = useState({
    learningSolution: [],
    profile: [],
    product: [],
    promotional: [],
  });

  // Track pagination and loading state for each ad type
  const [adTypeStates, setAdTypeStates] = useState(() => {
    const initialState = {};
    adTypes.forEach((type) => {
      initialState[type] = {
        currentPage: 1,
        hasMore: true,
        isLoading: false,
        totalRecords: 0,
      };
    });
    return initialState;
  });


  // Function to fetch ads by type with pagination
  const fetchAdsByType = async (type, page = 1, append = false) => {
    try {
      // Prevent multiple simultaneous requests for the same type
      if (adTypeStates[type]?.isLoading) {
        return;
      }

      // Update loading state
      setAdTypeStates((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          isLoading: true,
        },
      }));

      // @ts-ignore
      let validData: any[] = [];
      let totalRecords = 0;
      let totalPages = 1;
      let hasMore = false;

      if (type === "learningSolution") {
        // For learning solutions, use paginated API call like other types
        const { data: res } = await getAllAdUrl(page, pageSize, type);
        const fetchedData = res?.data || [];
        const meta = res?.meta || {};

        // Filter for learning solutions with displayOnDashboard = true
        validData = fetchedData.filter((ad) => {
          const isLearningAd =
            ad.adType === "learningSolution" || ad.type === "learningSolution";
          const shouldDisplay = ad.displayOnDashboard === true;
          return isLearningAd && shouldDisplay;
        });

        totalRecords = meta.totalRecords || 0;
        totalPages = meta.totalPages || 1;
        hasMore = page < totalPages;

      } else if (type === "profile") {
        // For profile type, fetch both regular profile ads and suggested profiles
        const [adsResponse, profilesResponse] = await Promise.all([
          getAllAdUrl(page, pageSize, type),
          getSuggestedProfiles({
            page: page,
            pageSize: Math.floor(pageSize / 2), // Half for suggested profiles
            onlyVerified: false
          })
        ]);

        // Get regular profile ads
        const profileAds = adsResponse?.data?.data || [];
        const suggestedProfiles = profilesResponse?.data?.data || [];

        // Transform suggested profiles to match ad structure
        const transformedProfiles = suggestedProfiles.map((profile) => ({
          ...profile, // Preserve all original profile properties
          id: `profile_${profile.id}`, // Create unique ID for ad system
          originalId: profile.id, // Keep original ID
          adType: 'profile',
          type: 'suggested_profile',
          isProfile: true,
          profileData: profile // Keep reference to original profile data
        }));

        validData = [...profileAds, ...transformedProfiles];

        // Calculate pagination based on combined results
        const adsMeta = adsResponse?.data?.meta || {};
        const profilesMeta = profilesResponse?.data?.meta || {};
        
        totalRecords = (adsMeta.totalRecords || 0) + (profilesMeta.totalRecords || 0);
        totalPages = Math.max(adsMeta.totalPages || 1, profilesMeta.totalPages || 1);
        hasMore = page < totalPages;

      } else {
        // For other ad types, use the regular API call
        const { data: res } = await getAllAdUrl(page, pageSize, type);
        const fetchedData = res?.data || [];
        const meta = res?.meta || {};
        totalRecords = meta.totalRecords || 0;
        totalPages = meta.totalPages || 1;
        hasMore = page < totalPages;

        validData = fetchedData;
      }

      // Use the like data directly from API response (no additional API calls needed)
      validData = validData.map((ad) => {
        // Initialize likedAds set based on isLiked from API
        if (ad.isLiked) {
          setLikedAds((prev) => new Set([...prev, ad.id]));
        }
        return {
          ...ad,
          // Ensure we have all the required properties with defaults
          isLiked: ad.isLiked || false,
          likeCount: ad.likeCount || 0,
          viewCount: ad.viewCount || 0,
          commentCount: ad.commentCount || 0,
        };
      });

      // Update ad list with processed data
      setAdListByType((prev) => {
        const newState = {
          ...prev,
          [type]: append ? [...prev[type], ...validData] : validData,
        };
        return newState;
      });

      // Update pagination state
      setAdTypeStates((prev) => ({
        ...prev,
        [type]: {
          currentPage: page,
          hasMore,
          isLoading: false,
          totalRecords,
        },
      }));
    } catch (err) {
      console.error(`Error fetching ads for type ${type}:`, err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );

      // Reset loading state on error
      setAdTypeStates((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          isLoading: false,
        },
      }));
    }
  };

  // Function to load more data for a specific ad type
  const loadMoreAds = useCallback(
    async (type) => {
      const currentState = adTypeStates[type];
      if (!currentState?.hasMore || currentState?.isLoading) {
        return;
      }

      const nextPage = currentState.currentPage + 1;
      await fetchAdsByType(type, nextPage, true);
    },
    [adTypeStates]
  );

  // Handle swiper slide change to trigger loading more data
  const handleSlideChange = useCallback(
    (swiper, type) => {
      const currentSlide = swiper.activeIndex;
      const totalSlides = swiper.slides.length;
      const slidesPerView =
        swiper.params.slidesPerView === "auto"
          ? Math.floor(swiper.width / 300) // Estimate based on card width
          : swiper.params.slidesPerView;

      // Trigger load more when approaching the end (2 slides before the end)
      const threshold = Math.max(totalSlides - slidesPerView - 2, 0);

      if (currentSlide >= threshold && adTypeStates[type]?.hasMore) {
        loadMoreAds(type);
      }
    },
    [adTypeStates, loadMoreAds]
  );

  // FIXME
  // Store swiper instance reference
  // const handleSwiperInit = useCallback(
  //   (swiper, type) => {
  //     swiperRefs.current[type] = swiper;

  //     // Add slide change listener
  //     swiper.on("slideChange", () => {
  //       handleSlideChange(swiper, type);
  //     });
  //   },
  //   [handleSlideChange]
  // );

  // FIXED: Simplified like functionality using data from ads API response
  const handleLike = useCallback(
    async (adId) => {
      try {
        // Make API call to toggle like on backend
        await toggleLikeAdUrl(adId);

        // Update the likedAds set by toggling current state
        setLikedAds((prev) => {
          const newLiked = new Set(prev);
          if (newLiked.has(adId)) {
            newLiked.delete(adId);
          } else {
            newLiked.add(adId);
          }
          return newLiked;
        });

        // Update the adList to reflect the like state change and adjust count
        setAdList((prevAdList) => {
          const updatedAdList = { ...prevAdList };
          Object.keys(updatedAdList).forEach((adKey) => {
            if (Array.isArray(updatedAdList[adKey])) {
              updatedAdList[adKey] = updatedAdList[adKey].map((ad) => {
                if (ad.id === adId) {
                  const wasLiked = ad.isLiked;
                  return {
                    ...ad,
                    isLiked: !wasLiked,
                    likeCount: wasLiked
                      ? Math.max(0, (ad.likeCount || 0) - 1)
                      : (ad.likeCount || 0) + 1,
                  };
                }
                return ad;
              });
            }
          });
          return updatedAdList;
        });

        // Update adListByType as well
        setAdListByType((prevAdListByType) => {
          const updatedAdListByType = { ...prevAdListByType };
          Object.keys(updatedAdListByType).forEach((adKey) => {
            if (Array.isArray(updatedAdListByType[adKey])) {
              updatedAdListByType[adKey] = updatedAdListByType[adKey].map(
                (ad) => {
                  if (ad.id === adId) {
                    const wasLiked = ad.isLiked;
                    return {
                      ...ad,
                      isLiked: !wasLiked,
                      likeCount: wasLiked
                        ? Math.max(0, (ad.likeCount || 0) - 1)
                        : (ad.likeCount || 0) + 1,
                    };
                  }
                  return ad;
                }
              );
            }
          });
          return updatedAdListByType;
        });
      } catch (err) {
        console.error("Error toggling like:", err);
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: err.message,
          })
        );
      }
    },
    [dispatch]
  );

  const handleSave = useCallback(
    (adId) => {
      setSavedAds((prev) => {
        const newSaved = new Set(prev);
        if (newSaved.has(adId)) {
          newSaved.delete(adId);
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.success,
              message: t("learning.removed_from_saved"),
            })
          );
        } else {
          newSaved.add(adId);
          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.success,
              message: t("learning.added_to_saved"),
            })
          );
        }
        return newSaved;
      });
    },
    [dispatch, t]
  );

  // Helper function to determine if an ad has video content
  const hasVideoContent = (ad) => {
    // Check common video properties
    return !!(
      ad.videoUrl ||
      ad.video ||
      ad.documents?.[0]?.includes(".mp4") ||
      ad.media?.some((m) => m.type === "video") ||
      ad.attachments?.some((a) => a.type === "video") ||
      (ad.content &&
        (ad.content.includes(".mp4") ||
          ad.content.includes(".webm") ||
          ad.content.includes("video")))
    );
  };

  const fetchInitialData = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      await Promise.all(adTypes.map((type) => fetchAdsByType(type, 1, false)));
    } catch (err) {
      dispatch(
        setAlert({ show: true, type: ALERT_TYPE.error, message: err.message })
      );
    }
  }, []);

  // NEW: Update ads load state when adList changes
  useEffect(() => {
    const combined = adTypes.flatMap((type) => adListByType[type] || []);
    const newAdList = categorizeAds(combined);

    if(JSON.stringify(adList) !== JSON.stringify(newAdList)) {
      const hasAnyAds = Object.values(newAdList).some(
        (ads) => Array.isArray(ads) && ads.length > 0
      );

      onAdsLoaded(hasAnyAds);
      setAdList(newAdList);
    }
  }, [adListByType, onAdsLoaded, adList]);

  useEffect(() => {
    // Reset pagination states when switching modes
    setAdTypeStates(() => {
      const initialState = {};
      adTypes.forEach((type) => {
        initialState[type] = {
          currentPage: 1,
          hasMore: true,
          isLoading: false,
          totalRecords: 0,
        };
      });
      return initialState;
    });

    const run = async () => {
      await fetchInitialData();
    };

    run();
  }, [fetchInitialData]);
  

  // Save to localStorage whenever savedAds changes
  useEffect(() => {
    localStorage.setItem("savedLearningAds", JSON.stringify([...savedAds]));
  }, [savedAds]);

  if (isAdLoading) {
    return <AdListSkeleton />;
  }

  return (
    <>
      {/* Only render ad sections if overview data has loaded and ads have loaded and have data */}
      {previousSectionLoaded &&
        dataLoadStates.ads.loaded &&
        Object.keys(adList).map((adKey) => {
          const adTypeOption = DASHBOARD_AD_TYPE_OPTIONS.find(
            (item) => item.id === adKey
          );
          if (!adTypeOption) {
            console.warn("No DASHBOARD_AD_TYPE_OPTIONS match for adKey:", adKey);
            return null;
          }

          // NEW: Only render if this specific ad type has data
          if (!Array.isArray(adList[adKey]) || adList[adKey].length <= 0) {
            return null;
          }

          return (
            <Box key={adKey} sx={{ width: "100%", overflow: "hidden" }}>
              <MuiTypography
                variant="h2"
                sx={{ fontWeight: 500, lineHeight: 1.6, mt: 3, mb: 1 }}
              >
                {mapAdCategoryTitle[adTypeOption.id]}
              </MuiTypography>
              <Divider sx={{ my: 2 }} />

              <Slider
              // FIXME: Add onSwiper to handle swiper init
              // onSwiper={(swiper) => handleSwiperInit(swiper, adKey)}
              >
                {(Array.isArray(adList[adKey]) ? adList[adKey] : []).map(
                  (item) => {
                    if (!item || typeof item !== "object" || !("id" in item)) {
                      console.warn("Skipping invalid adList item:", item);
                      return null;
                    }
                    const { id, ...rest } = item;

                    // Use ProffecionalCards for ALL profile type ads (both regular ads and suggested profiles)
                    if (adKey === "profile") {
                      // For suggested profiles, use the profileData
                      if (item.type === 'suggested_profile' && item.isProfile && item.profileData) {
                        return (
                          <SwiperSlide key={`suggested_profile_${id}`}>
                            <ProffecionalCards
                              profile={item.profileData}
                              onClick={() => handleProfileCardClick(item)}
                              showCompletionBadge={false}
                              showVerificationBadge={true}
                            />
                          </SwiperSlide>
                        );
                      }
                      
                      // For regular profile ads, use the item itself as profile data
                      return (
                        <SwiperSlide key={`profile_ad_${id}`}>
                          <ProffecionalCards
                            profile={item}
                            onClick={() => handleProfileCardClick(item)}
                            showCompletionBadge={false} 
                            showVerificationBadge={true}
                          />
                        </SwiperSlide>
                      );
                    }

                    // FIXED: Use LearningCard for learning solutions and ads with video content
                    // This enables hover-to-play functionality for all video content
                    if (adKey === "learningSolution" || hasVideoContent(item)) {
                      return (
                        <SwiperSlide key={`learning_video_ad_${id}`}>
                          <LearningCard
                            ad={{ id, ...rest, isLiked: likedAds.has(id) }}
                            isSaved={savedAds.has(id)}
                            onLike={() => handleLike(id)}
                            onSave={() => handleSave(id)}
                            alwaysPlay={false} // Enable hover-to-play
                            variant="dashboard"
                          />
                        </SwiperSlide>
                      );
                    }

                    // Use regular AdCard for non-video content
                    return (
                      <SwiperSlide key={`ad_${id}`}>
                        <AdCard
                          id={id}
                          enableImpressionTracking={true}
                          showCounts={false}
                          mappedType={mapAdCategoryTitle[adTypeOption.id]}
                          {...rest}
                        />
                      </SwiperSlide>
                    );
                  }
                )}

                {/* Loading indicator slide */}
                {adTypeStates[adKey]?.hasMore && (
                  <SwiperSlide key={`loading-${adKey}`}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "300px",
                        minWidth: "272px",
                      }}
                    >
                      {adTypeStates[adKey]?.isLoading ? (
                        <MuiTypography
                          variant="body1"
                          sx={{ textAlign: "center" }}
                        >
                          Loading more...
                        </MuiTypography>
                      ) : (
                        <MuiTypography
                          variant="body1"
                          sx={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => loadMoreAds(adKey)}
                        >
                          Load more
                        </MuiTypography>
                      )}
                    </Box>
                  </SwiperSlide>
                )}
              </Slider>
            </Box>
          );
        })}

      {/* Professional Profile Popup */}
      <ProfessionalProfilePopup
        open={dialogOpen}
        user={selectedUser}
        onClose={() => setDialogOpen(false)}
        isLoading={false}
      />
    </>
  );
}

export default DashboardAdsSection;
