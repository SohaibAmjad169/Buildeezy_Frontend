import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";

import ViewJobDetailsSkeleton from "../../components/skeleton/ViewJobDetailsSkeleton";
import ViewAdDetails from "../../components/viewAdDetails";
import useUserCategories from "../../hooks/useUserCategories";
import useFetchAdDetails from "../../hooks/useFetchAdDetails";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import { mapAdCategoryTitle } from "../../utils/constants/ad";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { useTranslation } from "react-i18next";

function AllAdsViewDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { webinarId, authorId, authorName } = location.state || {};
  const { t } = useTranslation();

  const { loading } = useSelector((state) => state.config);
  const { adDetails } = useSelector((state) => state.ad);
  const dispatch = useDispatch();

  const { profileData } = useSelector((state) => state.profile);
  const isAdmin = profileData?.userType === "admin";

  const [savedAds, setSavedAds] = useState(() => {
    // Initialize saved ads from localStorage
    const saved = localStorage.getItem("savedLearningAds");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const { fetchAdById } = useFetchAdDetails();
  const { categories } = useUserCategories();

  useEffect(() => {
    fetchAdById(id);
  }, [fetchAdById, id]);
  // Save to localStorage whenever savedAds changes
  useEffect(() => {
    localStorage.setItem("savedLearningAds", JSON.stringify([...savedAds]));
  }, [savedAds]);

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

  if (loading) {
    return <ViewJobDetailsSkeleton />;
  }

  const from = location.state?.from;

  let pastLinks, activeLink;
  if (from === "ideas-lounge") {
    pastLinks = [{ label: "Ideas Lounge", path: "/ideas-lounge" }];
    activeLink = { label: "Ideas Lounge" };
  } else {
    pastLinks = [
      {
        label: t("breadcrumbs.dashboard"),
        path: `${!isAdmin ? "/dashboard" : "/admin/dashboard"}`,
      },
    ];
    activeLink = { label: mapAdCategoryTitle[adDetails?.adType] };
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "70%" },
        }}
      >
        <MuiBreadcrumbs pastLinks={pastLinks} activeLink={activeLink} />
        <ViewAdDetails
          adDetails={adDetails}
          categories={categories}
          isSaved={savedAds.has(adDetails.id)}
          onSave={() => handleSave(adDetails.id)}
          webinarId={webinarId}
          authorId={authorId}
          authorName={authorName}
        />
      </Box>
    </Box>
  );
}

export default AllAdsViewDetails;
