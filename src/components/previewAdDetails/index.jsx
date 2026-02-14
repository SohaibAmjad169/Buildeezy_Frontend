import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  useTheme,
  useMediaQuery,
  DialogContent,
  Dialog,
} from "@mui/material";
import { ArrowBackIos, Visibility } from "@mui/icons-material";
import { colors } from "../../styles/theme";

import ViewJobDetailsSkeleton from "../skeleton/ViewJobDetailsSkeleton";
import ViewAnAd from "../viewAdDetails";
import MuiDialog from "../common/MuiDialog";
import useUserCategories from "../../hooks/useUserCategories";
import { useEffect } from "react";
import { isEmpty } from "lodash";
import PaymentMethodSelector from "../common/PaymentMethodSelector";

const getThemeColor = (theme) => {
  switch (theme) {
    case "green":
      return "#F7FFE6";
    case "white":
      return colors.white;
    case "blue":
      return colors.blue300;
    case "grey":
      return colors.grey400;
    case "purple":
      return colors.purple;
    case "yellow":
      return colors.orange200;
    case "rose":
      return colors.red300;
    default:
      return "rgba(255, 255, 240, 0.5)"; // Light yellow background as default
  }
};

function PreviewAdDetails({
  adDetails,
  handleAdEdit,
  handleAdSubmit,
  handleClosePayment,
  openPaymentDialog,
  openSubmitDialog,
  setOpenSubmitDialog,
  isPaymnetCalculator,
}) {
  const { t } = useTranslation();
  const { loading } = useSelector((state) => state.config);
  // const fullUrl = window.location.href;
  const { categories, fetchCategoryByType } = useUserCategories();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // 768px

  // Get theme color from adDetails
  const themeColor = getThemeColor(adDetails?.layout?.theme);

  useEffect(() => {
    if (
      !isEmpty(adDetails) &&
      !adDetails.audience.every((item) => item === "client")
    ) {
      fetchCategoryByType(adDetails.audience.join(","));
    }
  }, [adDetails]);

  function onSubmitDialogClose() {
    setOpenSubmitDialog(false);
  }
  async function onSubmitDialog() {
    setOpenSubmitDialog(true);
  }

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        backgroundColor: themeColor,
        display: "flex",
        justifyContent: "center",
        margin: { xs: "-16px", md: 0 },
        width: { xs: "calc(100% + 32px)", md: "100%" },
      }}
    >
      {loading ? (
        <ViewJobDetailsSkeleton />
      ) : (
        <Box
          sx={{
            width: { xs: "100%", lg: "70%" },
            pt: { xs: 0, md: 4 },
            px: { xs: 2, lg: 0 },
            pb: { xs: 8, md: 0 },
          }}
        >
          {/* Top Navigation Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 0.25, md: 2 },
              alignItems: { xs: "flex-start", md: "center" },
              mb: { xs: 0.25, md: 4 },
              mt: { xs: 0.25, md: 0 },
              minHeight: { xs: "40px", md: "120px" },
              px: { xs: 0, md: 0 },
              width: "100%",
            }}
          >
            <Button
              fullWidth={isMobile}
              variant="text"
              onClick={handleAdEdit}
              startIcon={<ArrowBackIos sx={{ fontSize: isMobile ? 12 : 16 }} />}
              sx={{
                color: colors.primary,
                height: { xs: "32px", md: "auto" },
                width: { xs: "auto", md: "auto" },
                alignSelf: { xs: "flex-start", md: "center" },
                "& .MuiButton-startIcon": {
                  marginRight: 0.5,
                },
                "&:hover": {
                  backgroundColor: "transparent",
                  color: colors.primary800,
                },
              }}
            >
              {t("profile.preview.back_to_edit")}
            </Button>
            <Button
              fullWidth={isMobile}
              variant="contained"
              startIcon={<Visibility sx={{ fontSize: isMobile ? 12 : 16 }} />}
              disableRipple
              sx={{
                backgroundColor: colors.primary,
                color: colors.white,
                height: { xs: "32px", md: "auto" },
                width: { xs: "auto", md: "auto" },
                alignSelf: { xs: "flex-start", md: "center" },
                "& .MuiButton-startIcon": {
                  marginRight: 0.5,
                },
                boxShadow: "none",
                cursor: "default",
                pointerEvents: "none",
              }}
            >
              {t("common.preview_mode")}
            </Button>
          </Box>

          <ViewAnAd
            adDetails={adDetails}
            categories={categories}
            isPreview={true}
            isMobile={isMobile}
          />

          {/* Bottom Navigation */}
          <Box
            sx={{
              width: "100%",
              py: { xs: 0.5, md: 2 },
              mt: { xs: -4, md: 2 },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 0.5, md: 2 },
              backgroundColor: themeColor,
              px: isMobile ? 2 : 0,
              borderTop: isMobile ? `1px solid ${colors.grey200}` : "none",
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", md: "85%" },
                height: "1px",
                backgroundColor: colors.primary,
                display: { xs: "none", md: "block" },
                margin: { md: "0 auto" },
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: { xs: "center", md: "flex-end" },
                gap: 2,
                width: { xs: "100%", md: "85%" },
                margin: "0 auto",
              }}
            >
              <Button
                variant="text"
                onClick={handleAdEdit}
                sx={{
                  color: colors.primary,
                  height: "40px",
                  width: { xs: "40%", md: "120px" },
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: colors.primary800,
                  },
                }}
              >
                {t("common.go_back")}
              </Button>
              <Button
                variant="contained"
                onClick={onSubmitDialog}
                sx={{
                  backgroundColor: colors.primary,
                  color: "white",
                  height: "40px",
                  width: { xs: "40%", md: "120px" },
                  "&:hover": {
                    backgroundColor: colors.primary800,
                  },
                }}
              >
                {t("common.submit")}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      <MuiDialog
        title={t("ad.details.submit_ad")}
        open={openSubmitDialog}
        handleClose={onSubmitDialogClose}
        handleSuccess={handleAdSubmit}
        yesLabel={t("submit")}
        noLabel={t("cancel")}
      />

      <Dialog
        open={
          isPaymnetCalculator === "yes"
            ? openPaymentDialog
            : adDetails?.adType !== "learningSolution" && openPaymentDialog
        }
        // onClose={handleClosePayment}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            handleClosePayment();
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogContent sx={{ p: 0, minWidth: { xs: 300, sm: 500, md: 600 } }}>
          <PaymentMethodSelector onClose={handleClosePayment} page={"ads"} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default PreviewAdDetails;
