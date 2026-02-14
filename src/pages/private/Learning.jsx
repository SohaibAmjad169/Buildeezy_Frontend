import { useEffect, useState, Suspense, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Box, Grid, Button, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { ALERT_TYPE } from "../../utils/constants/config";
import { setAlert } from "../../redux/configSlice";
import {
  getAllAdUrl,
  getMyAdUrl,
  toggleLikeAdUrl,
} from "../../apis/apiEndPoints";
import FallbackSpinner from "../../components/common/FallbackSpinner";
import LearningCard from "../../components/learning/LearningCard";
import { useNavigate } from "react-router-dom";
import { colors } from "../../styles/theme";
import LearningTabsAndSearch, {
  TABS,
  searchLearningAds,
} from "../../components/learning/LearningTabsAndSearch";
import { setFetchNextLoading } from "../../redux/jobSlice";
import SeeMore from "../../components/common/SeeMore";
import VideoCardSkeleton from "../../components/skeleton/VideoCardSkeleton";

function LearningContent() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileData = useSelector((state) => state.profile);
  const loginUserId = profileData?.profileData?.id;

  const [selectedTab, setSelectedTab] = useState(TABS.ALL);
  const [learningAds, setLearningAds] = useState([]);

  const [queueLearningAds, setQueueLearningAds] = useState([]);

  const [likedAds, setLikedAds] = useState(new Set());

  const [savedAds, setSavedAds] = useState(() => {
    const saved = localStorage.getItem("savedLearningAds");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { fetchNextLoading } = useSelector((state) => state.job);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const [paginationModel, setPaginationModel] = useState({
    page: 1,
    pageSize: 8,
    adType: "learningSolution",
  });

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce time

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    // Reset pagination if tab is ALL
    setHasMoreData(true);
    if (selectedTab === TABS.ALL || selectedTab === TABS.MY_LEARNINGS) {
      const newModel = {
        page: 1,
        pageSize: 8,
        adType: "learningSolution",
      };
      setPaginationModel(newModel);
      setHasMoreData(true);
      fetchLearningAds(newModel); // pass explicitly
    } else {
      fetchLearningAds();
    }
  }, [selectedTab, loginUserId, debouncedSearchQuery]);

  // Save to localStorage whenever savedAds changes
  useEffect(() => {
    localStorage.setItem("savedLearningAds", JSON.stringify([...savedAds]));
  }, [savedAds]);

  const fetchLearningAds = async (model = paginationModel, currentTab) => {
    try {
      setLoading(true);
      let response;

      if (currentTab === TABS.MY_LEARNINGS) {
        response = await getMyAdUrl(
          model?.page,
          model?.pageSize,
          model?.adType
        );
      } else {
        response = await getAllAdUrl(
          model?.page,
          model?.pageSize,
          model?.adType
        );
      }

      const ads = response.data.data;

      setTotalRecords(response?.data?.meta?.totalRecords || 0);

      let filteredAds = ads;

      switch (selectedTab) {
        case TABS.SAVED:
          filteredAds = filteredAds.filter((ad) => savedAds.has(ad.id));
          break;
      }

      filteredAds = searchLearningAds(filteredAds, debouncedSearchQuery);

      filteredAds.sort((a, b) => {
        const dateA = new Date(
          a.startAt || a.createdAt || a.created_at || a.created
        );
        const dateB = new Date(
          b.startAt || b.createdAt || b.created_at || b.created
        );
        return dateB - dateA;
      });

      // ADDED: Initialize like data and likedAds Set
      const processedAds = filteredAds.map((ad) => ({
        ...ad,
        isLiked: ad.isLiked || false,
        likeCount: ad.likeCount || 0,
        viewCount: ad.viewCount || 0,
        commentCount: ad.commentCount || 0,
        isReady: false,
      }));

      // Update likedAds Set based on API data
      const likedAdIds = processedAds
        .filter((ad) => ad.isLiked)
        .map((ad) => ad.id);
      if (likedAdIds.length > 0) {
        setLikedAds((prev) => new Set([...prev, ...likedAdIds]));
      }

      setLearningAds(processedAds);
      const hasReadyAds = processedAds.some((ad) => ad.isReady);
      setQueueLearningAds( hasReadyAds ? processedAds.filter((ad) => ad.isReady) : processedAds.slice(0, 1));
      
    } catch (err) {
      console.error("Error fetching ads:", err);
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  async function fetchNextContracts() {
    const newPaginationModel = {
      ...paginationModel,
      page: paginationModel.page + 1,
    };
    setPaginationModel(newPaginationModel);
    try {
      dispatch(setFetchNextLoading(true));
      let response;

      if (selectedTab === TABS.MY_LEARNINGS) {
        response = await getMyAdUrl(
          newPaginationModel?.page,
          newPaginationModel?.pageSize
        );
      } else {
        response = await getAllAdUrl(
          newPaginationModel?.page,
          newPaginationModel?.pageSize,
          newPaginationModel?.adType
        );
      }

      const resData = response?.data?.data;

      // ADDED: Process new data with like information
      const processedNewData = resData.map((ad) => ({
        ...ad,
        isLiked: ad.isLiked || false,
        likeCount: ad.likeCount || 0,
        viewCount: ad.viewCount || 0,
        commentCount: ad.commentCount || 0,
        isReady: false,
      }));

      // Update likedAds Set for new data
      const newLikedAdIds = processedNewData
        .filter((ad) => ad.isLiked)
        .map((ad) => ad.id);
      if (newLikedAdIds.length > 0) {
        setLikedAds((prev) => new Set([...prev, ...newLikedAdIds]));
      }

      const newRowList = [...learningAds, ...processedNewData];
      setLearningAds(newRowList);
      setQueueLearningAds((prevAds) => {
        const newQueueLearningAds = prevAds.concat(processedNewData.slice(0, 1))
        return newQueueLearningAds;
      });

      if (newRowList.length >= totalRecords) {
        setHasMoreData(false);
      }
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    } finally {
      dispatch(setFetchNextLoading(false));
    }
  }

  const handleVideoReady = (adId) => {
    setQueueLearningAds((prevAds) => {
      let _queueLearningAds = prevAds.map((ad) => (ad.id === adId ? { ...ad, isReady: true } : ad))
      if (_queueLearningAds.length >=  learningAds.length) return _queueLearningAds;
      const newQueueLearningAds = _queueLearningAds.concat(learningAds.slice(_queueLearningAds.length, _queueLearningAds.length + 1))
      return newQueueLearningAds;
    });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleLike = async (adId) => {
    try {
      await toggleLikeAdUrl(adId);

      // Update the likedAds set
      setLikedAds((prev) => {
        const newLiked = new Set(prev);
        if (newLiked.has(adId)) {
          newLiked.delete(adId);
        } else {
          newLiked.add(adId);
        }
        return newLiked;
      });

      // ADDED: Update the learningAds array to reflect the like state change
      setLearningAds((prevAds) =>
        prevAds.map((ad) => {
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
        })
      );
    } catch (err) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: err.message,
        })
      );
    }
  };

  const handleSave = (adId) => {
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
  };

  const handleCreateAd = () => {
    navigate("/post-an-ad", { state: { type: "learningSolution" } });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <LearningTabsAndSearch
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        // showEmptyState={learningAds.length === 0}
        // emptyStateMessage={
        //   selectedTab === TABS.MY_LEARNINGS
        //     ? t("learning.no_my_learnings")
        //     : selectedTab === TABS.SAVED
        //     ? t("learning.no_saved_learnings")
        //     : t("learning.no_learnings")
        // }
        title={t("learning.title")}
        onCreateAd={handleCreateAd}
      />

      {/* Learning Ads Grid */}

      {loading ? (
        <VideoCardSkeleton />
      ) : learningAds.length > 0 ? (
        <Box sx={{ mt: 3, mx: { xs: -2, md: -3 } }}>
          <Box sx={{ px: { xs: 2, md: 3 } }}>
            <Grid
              container
              sx={{
                width: "100%",
                margin: 0,
                display: "flex",
                gap: "16px",
                "& .MuiGrid-item": {
                  padding: "0 !important",
                  margin: 0,
                },
              }}
            >
              {queueLearningAds.map((ad) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  lg={3}
                  key={ad.id}
                  sx={{
                    height: "100%",
                    width: {
                      xs: "100%",
                      sm: "calc((100% - 16px) / 2)",
                      md: "calc((100% - 48px) / 3)",
                      lg: "calc((100% - 48px) / 4)",
                    },
                    maxWidth: {
                      xs: "100%",
                      sm: "calc((100% - 16px) / 2)",
                      md: "calc((100% - 48px) / 4)",
                      lg: "calc((100% - 48px) / 4)",
                    },
                  }}
                >
                  <Box sx={{ height: "100%" }}>
                    <LearningCard
                      ad={ad}
                      isLiked={likedAds.has(ad.id)}
                      isSaved={savedAds.has(ad.id)}
                      onLike={() => handleLike(ad.id)}
                      onSave={() => handleSave(ad.id)}
                      variant="default" // Use default variant for the learning page
                      handleVideoReady={() => handleVideoReady(ad.id)}
                    />
                  </Box>
                </Grid>
              ))}

            </Grid>
            {selectedTab !== TABS.SAVED && (
              <SeeMore
                handleSeeMore={fetchNextContracts}
                isShow={hasMoreData}
                isLoading={fetchNextLoading}
              />
            )}
          </Box>
        </Box>
      ) : (
        <Box>
          {selectedTab === TABS.MY_LEARNINGS && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleCreateAd}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: colors.primary,
                  "&:hover": {
                    backgroundColor: colors.primary800,
                  },
                }}
              >
                {t("learning.add_new")}
              </Button>
            </Box>
          )}
          {!loading && learningAds?.length === 0 && (
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body1" color="text.secondary">
                {selectedTab === TABS.MY_LEARNINGS
                  ? t("learning.no_my_learnings")
                  : selectedTab === TABS.SAVED
                  ? t("learning.no_saved_learnings")
                  : t("learning.no_learnings")}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function Learning() {
  return (
    <Suspense fallback={<FallbackSpinner />}>
      <LearningContent />
    </Suspense>
  );
}

export default Learning;
