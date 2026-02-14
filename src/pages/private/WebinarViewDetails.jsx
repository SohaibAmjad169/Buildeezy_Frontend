import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";

import ViewJobDetailsSkeleton from "../../components/skeleton/ViewJobDetailsSkeleton";
import useUserCategories from "../../hooks/useUserCategories";
import useFetchWebinarDetails from "../../hooks/useFetchWebinarDetails";
import MuiBreadcrumbs from "../../components/common/Breadcrumbs";
import ViewWebinarDetails from "../../components/viewWebinarDetails";

function WebinarViewDetails() {
  const { id } = useParams();
  const location = useLocation();

  const { loading } = useSelector((state) => state.config);
  const { adDetails } = useSelector((state) => state.ad);

  const { fetchWebinarById } = useFetchWebinarDetails();
  const { categories } = useUserCategories();

  useEffect(() => {
    fetchWebinarById(id);
  }, [fetchWebinarById, id]);

  if (loading) {
    return <ViewJobDetailsSkeleton />;
  }

  const from = location.state?.from;
  let pastLinks, activeLink;
  if (from === "ideas-lounge") {
    pastLinks = [{ label: "Ideas Lounge", path: "/ideas-lounge" }];
    activeLink = { label: "Webinars" };
  } else {
    pastLinks = [{ label: "Dashboard", path: "/dashboard" }];
    activeLink = { label: "Webinars" };
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
        <ViewWebinarDetails webinarDetails={adDetails} categories={categories} />
      </Box>
    </Box>
  );
}

export default WebinarViewDetails;
