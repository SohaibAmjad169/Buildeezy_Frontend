import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { isEmpty } from "lodash";

import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import ViewJobDetailsSkeleton from "../../components/skeleton/ViewJobDetailsSkeleton";
import { ROUTES } from "../../utils/constants/route";
import useFetchAdDetails from "../../hooks/useFetchAdDetails";
import ViewAdDetails from "../../components/viewAdDetails";
import useUserCategories from "../../hooks/useUserCategories";

function MyWebinarViewDetails() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { loading } = useSelector((state) => state.config);
  const { adDetails } = useSelector((state) => state.ad);

  const { fetchAdById } = useFetchAdDetails();
  const { categories, fetchCategoryByType } = useUserCategories();

  const pastLinks = [
    {
      label: t("breadcrumbs.my_ads"),
      path: "/" + ROUTES.myAds,
    },
  ];
  const activeLink = {
    label: t("details"),
  };

  useEffect(() => {
    if (
      !isEmpty(adDetails) &&
      !adDetails.audience.every((item) => item === "client")
    ) {
      fetchCategoryByType(adDetails.audience.join(","));
    }
  }, [adDetails]);

  useEffect(() => {
    //fetch ad by id
    fetchAdById(id);
  }, [fetchAdById, id]);

  if (loading) {
    return <ViewJobDetailsSkeleton />;
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
          isMyAd={true}
        />
      </Box>
    </Box>
  );
}

export default MyWebinarViewDetails;