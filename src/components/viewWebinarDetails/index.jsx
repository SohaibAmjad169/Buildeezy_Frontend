import { useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Rating, styled } from "@mui/material";
import { Eye } from "iconsax-react";

import MuiTypography from "../common/MuiTypography";
import { getAllFirstCharUpperCase } from "../../utils/common";
import logoPlaceholder from "../../assets/images/logo_placeholder.svg";
import DocList from "../upload/DocList";
import SingleDocView from "../common/SingleDocView";
import { colors } from "../../styles/theme";
import WebinarActionButtons from "../myWebinars/WebinarActionButtons";
import MuiDialog from "../common/MuiDialog";
import { setAlert, setLoading } from "../../redux/configSlice";
import { deleteAdUrl } from "../../apis/apiEndPoints";
import { ALERT_TYPE } from "../../utils/constants/config";
import ActionButton from "../common/ActionButton";
import PreviewReviews from "../preview/PreviewReviews";
import LearningWebinarDetails from "./LearningWebinarDetails";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const StyledRating = styled(Rating)({
  "& .MuiRating-iconEmpty": {
    color: "#faaf00",
  },
});

function ViewWebinarDetails({
  webinarDetails,
  isMyWebinar = false,
  isPreview = false,
  isMobile,
  fontFamily,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const isLearningWebinar =
    webinarDetails?.adType === "learningSolution" ||
    webinarDetails?.type === "learningSolution";

  function onEditWebinar(e) {
    e.stopPropagation();
    navigate("/my-webinars/edit/" + webinarDetails.id);
  }

  function onDeleteDialogClose() {
    setOpenDeleteDialog(false);
  }

  function onDeleteWebinar() {
    setOpenDeleteDialog(true);
  }

  async function onDelete() {
    try {
      dispatch(setLoading(true));
      await deleteAdUrl(webinarDetails.id);
      onDeleteDialogClose();
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("webinar.deleted_successfully"),
        })
      );
      navigate("/my-webinars");
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

  function onViewProfile() {
    navigate("profile", {
      state: { userId: webinarDetails.author.id, adId: webinarDetails.id },
    });
  }

  function handleCallToAction() {
    if (webinarDetails.state === "learnMore" && webinarDetails.url) {
      window.open(webinarDetails.url, "_blank");
    } else if (webinarDetails.state === "contact") {
      // Handle contact action
      console.log("Contact action");
    }
  }

  if (isLearningWebinar) {
    return (
      <LearningWebinarDetails
        webinarDetails={webinarDetails}
        isMyWebinar={isMyWebinar}
        isPreview={isPreview}
      />
    );
  }

  // Original ViewWebinarDetails component return for non-learning ads
  return (
    <Box
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        px: { xs: 1, md: 3 },
        fontFamily: fontFamily,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "flex-end",
          mt: 2,
          mb: 1,
          maxWidth: "800px",
          ml: "auto",
          mr: "auto",
        }}
      >
        {isMyWebinar && (
          <Box
            sx={{
              display: "flex",
              mt: { xs: 2, md: 0 },
              width: { xs: "100%", sm: "50%", md: "40%" },
              gap: 1,
            }}
          >
            <WebinarActionButtons
              onEditWebinar={onEditWebinar}
              onDeleteWebinar={onDeleteWebinar}
            />
          </Box>
        )} 
        {!isMyWebinar && !isPreview && (
          <ActionButton
            variant="contained"
            onClick={onViewProfile}
            startIcon={Eye}
            sx={{
              mt: { xs: 2, md: 0 },
              mb: { xs: 1, md: 0 },
            }}
          >
            {t("webinar.details.view_profile")}
          </ActionButton>
        )}
      </Box>

      <Box
        sx={{
          maxWidth: "800px",
          mx: "auto",
          width: "100%",
          pb: { xs: 10, md: 0 },
        }}
      >
        <Box
          sx={{
            mt: { xs: 1, md: 3 },
          }}
        >
          <SingleDocView file={webinarDetails?.documents?.[0]} isMobile={isMobile} />
        </Box>

        <Box
          sx={{
            width: "100%",
            mt: 2,
          }}
        >
          <Box sx={{ maxWidth: "800px", ml: 0 }}>
            <MuiTypography
              variant="h1"
              sx={{
                mt: 3,
                mb: 3,
                color: "primary.main",
                fontWeight: 600,
              }}
            >
              {getAllFirstCharUpperCase(webinarDetails?.headline)}
            </MuiTypography>

            <Box sx={{ my: 5 }}>
              <MuiTypography
                variant="h2"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  mt: 3,
                  mb: 3,
                }}
              >
                {t("webinar.details.description")}
              </MuiTypography>
              {webinarDetails?.description ? (
                <MuiTypography variant="h3" sx={{ color: "primary.main" }}>
                  {webinarDetails?.description}
                </MuiTypography>
              ) : (
                <MuiTypography
                  variant="subtitle2"
                  sx={{ color: "primary.main" }}
                >
                  {t("webinar.details.no_description")}
                </MuiTypography>
              )}
            </Box>

            <DocList documents={webinarDetails?.documents} isMobile={isMobile} />

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                width: "100%",
                my: 3,
              }}
            >
              <Box sx={{ width: "100%" }}>
                <MuiTypography
                  variant="h2"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    mt: 3,
                  }}
                >
                  {t("webinar.details.business_details")}
                </MuiTypography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    pt: 2,
                    borderRadius: "8px",
                    alignItems: "center",
                  }}
                >
                  {webinarDetails?.logo ? (
                    <Box
                      component="img"
                      src={
                        webinarDetails.logo.includes("https:")
                          ? webinarDetails.logo
                          : IMAGE_URL + webinarDetails.logo
                      }
                      alt="logo"
                      sx={{
                        height: 80,
                        width: 80,
                        borderRadius: "40px",
                        border: `1px solid ${colors.white}`,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={logoPlaceholder}
                      alt="logo"
                      sx={{
                        height: 46,
                        color: colors.primary,
                        width: 46,
                        borderRadius: "40px",
                        border: `1px solid ${colors.white}`,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <Box>
                    <MuiTypography
                      variant="h2"
                      sx={{
                        fontWeight: 600,
                        color: "primary.main",
                        mb: 2,
                        pl: 0.5,
                      }}
                    >
                      {webinarDetails?.businessName}
                    </MuiTypography>
                    <MuiTypography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 500,
                        color: "primary.main",
                        pl: 0.5,
                      }}
                    >
                      {webinarDetails?.url}
                    </MuiTypography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Reviews Section */}
            <Box sx={{ width: "100%", my: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <MuiTypography
                  variant="h2"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                >
                  {t("profile.preview.reviews")}
                </MuiTypography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <StyledRating
                      value={webinarDetails?.reviews?.length || 0}
                      precision={0.1}
                      readOnly
                      size="medium"
                    />
                    <MuiTypography variant="body1" sx={{ color: "primary.main", fontFamily: fontFamily }}>
                      {webinarDetails?.reviews?.length || 0}
                    </MuiTypography>
                  </Box>
                  <MuiTypography
                    variant="subtitle2"
                    sx={{
                      color: "primary.main",
                      mt: 0.5,
                    }}
                  >
                    {webinarDetails?.reviews?.length || 0}{" "}
                    {t("profile.preview.reviews")}
                  </MuiTypography>
                </Box>
              </Box>
              <PreviewReviews reviewsData={webinarDetails?.reviews} />
            </Box>

            {/* Call to Action Section */}
            {webinarDetails?.state && (
              <Box sx={{ width: "100%", my: 4 }}>
                <MuiTypography
                  variant="h2"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  {t("webinar.details.call_to_action")}
                </MuiTypography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ActionButton
                    variant="contained"
                    onClick={handleCallToAction}
                    sx={{
                      backgroundColor: colors.primary,
                      color: colors.white,
                      fontSize: "0.75rem",
                      padding: "8px 16px",
                      minWidth: "120px",
                      height: "32px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: colors.primary800,
                        transform: "translateY(-1px)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    {t("webinar.details.contact")}
                  </ActionButton>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      {isMyWebinar && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "flex-end",
            mt: 2,
            mb: 1,
            maxWidth: "800px",
            ml: "auto",
            mr: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              mt: { xs: 2, md: 0 },
              width: { xs: "100%", sm: "50%", md: "40%" },
              gap: 1,
            }}
          >
            <WebinarActionButtons
              onEditWebinar={onEditWebinar}
              onDeleteWebinar={onDeleteWebinar}
            />
          </Box>
        </Box>
      )}

      <MuiDialog
        title={t("webinar.delete_ad")}
        open={openDeleteDialog}
        handleClose={onDeleteDialogClose}
        handleSuccess={onDelete}
        yesLabel={t("delete")}
        noLabel={t("cancel")}
      />
    </Box>
  );
}

ViewWebinarDetails.propTypes = {
  webinarDetails: PropTypes.object,
  isMyWebinar: PropTypes.bool,
  isPreview: PropTypes.bool,
  isMobile: PropTypes.bool,
};

export default ViewWebinarDetails;
