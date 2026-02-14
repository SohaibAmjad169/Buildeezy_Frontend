import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";

import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { deleteAdUrl, getMyAdUrl } from "../../apis/apiEndPoints";
import AdCard from "./AdCard";
import MuiTypography from "../common/MuiTypography";
import { categorizeAds } from "../../utils/common";
import AdListSkeleton from "../skeleton/AdListSkeleton";
import MuiDialog from "../common/MuiDialog";
import { setAdList } from "../../redux/adSlice";
import { cloneDeep } from "lodash";
import NoData from "../common/NoData";
import { mapAdCategoryTitle } from "../../utils/constants/ad";

function MyAdList() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [adListData, setAdListData] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [adId, setAdId] = useState("");

  const { loading } = useSelector((state) => state.config);
  const { adList } = useSelector((state) => state.ad);

  useEffect(() => {
    if (adList.length > 0) {
      // Filter out learning ads before categorizing
      const filteredAds = adList.filter(
        (ad) =>
          ad.adType !== "learningSolution" && ad.type !== "learningSolution"
      );
      setAdListData(categorizeAds(adList));
    }
  }, [adList]);

  const fetchMyAds = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const { data: res } = await getMyAdUrl();
      
      // The API response now includes count data for each ad
      // Store the complete ad data including all counts (likes, views, comments, impressions)
      dispatch(setAdList(res.data));
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
  }, [dispatch]);

  useEffect(() => {
    fetchMyAds();
  }, [fetchMyAds]);

  function onDeleteDialogClose() {
    setOpenDeleteDialog(false);
  }

  function onDeleteAd(id) {
    setAdId(id);
    setOpenDeleteDialog(true);
  }

  async function onDelete() {
    try {
      dispatch(setLoading(true));
      await deleteAdUrl(adId);
      onDeleteDialogClose();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("ad.deleted_successfully"),
        })
      );
      //update Ad list
      const newAdList = cloneDeep(adList);
      const findIndex = newAdList.findIndex((ad) => ad.id === adId);
      if (findIndex !== -1) {
        newAdList.splice(findIndex, 1);
        dispatch(setAdList(newAdList));
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
      dispatch(setLoading(false));
    }
  }

  if (loading) {
    return <AdListSkeleton />;
  }

  return (
    <Box sx={{ mt: 2, minHeight: "75vh" }}>
      {Object.keys(adListData).length > 0 ? (
        Object.keys(adListData)?.map((category) => (
          <Box key={category}>
            <MuiTypography
              variant="h4"
              sx={{
                fontWeight: 600,
                mb: 1.5,
              }}
            >
              {mapAdCategoryTitle[category] || "Uncategorized Ads"}
            </MuiTypography>
            <Box
              sx={{
                display: "grid",
                gap: 4,
                mb: 3,
                gridTemplateColumns: {
                  xs: "1fr", // 1 column on extra-small screens (mobile)
                  sm: "repeat(2, 1fr)", // 2 columns on small screens
                  md: "repeat(3, 1fr)", // 3 columns on medium screens
                  lg: "repeat(4, 1fr)", // 4 columns on large screens
                  xl: "repeat(5, 1fr)", // 5 columns on extra-large screens
                },
              }}
            >
              {adListData[category]?.map(({ 
                id, 
                adType,
                type,
                state,
                likeCount, 
                viewCount, 
                commentCount, 
                impressionCount, 
                ...rest 
              }) => {
                // Check if this is a learning solution ad
                const isLearningAd = adType === "learningSolution" || type === "learningSolution";
                
                return (
                  <AdCard
                    key={id}
                    id={id}
                    mappedType={mapAdCategoryTitle[category] || "Uncategorized"}
                    handleDeleteAd={onDeleteAd}
                    showActions={true}
                    showCounts={true} // Always show counts section (at least impressions)
                    showEngagementCounts={isLearningAd} // Only show likes/views/comments for learning solutions
                    enableImpressionTracking={false} // No tracking needed in My Ads (user owns these ads)
                    // Pass state from API response
                    status={state}
                    // Pass all count data from API response
                    likeCount={likeCount || 0}
                    viewCount={viewCount || 0}
                    commentCount={commentCount || 0}
                    impressionCount={impressionCount || 0}
                    {...rest}
                  />
                );
              })}
            </Box>
          </Box>
        ))
      ) : (
        <NoData />
      )}

      <MuiDialog
        title={t("ad.delete_ad")}
        open={openDeleteDialog}
        handleClose={onDeleteDialogClose}
        handleSuccess={onDelete}
        yesLabel={t("delete")}
        noLabel={t("cancel")}
      />
    </Box>
  );
}

export default MyAdList;