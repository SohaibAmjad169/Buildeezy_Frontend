import {
  Box,
  Grid,
  Stack,
  Typography,
  Divider,
  Paper,
  TextField,
  Dialog,
  DialogContent,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import MuiTypography from "../common/MuiTypography";
import FormFields from "../common/FormFields";
import MuiDatePickerBox from "../common/MuiDatePickerBox";
import dayjs from "dayjs";
import PreviewButton from "../profile/design/PreviewButton";
import SaveCancelButtons from "../common/SaveCancelButtons";
import { setAlert } from "../../redux/configSlice";
import { useDispatch } from "react-redux";
import { useState, useCallback, useMemo } from "react";
import PaymentMethodSelector from "../common/PaymentMethodSelector";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import EnhancedPriceCalculator from "./EnhancedPriceCalculator";

function DesktopPostAd({
  adField,
  onValueChange,
  onDateValueChange,
  onAdPreview,
  onSave,
  onCancel,
  isEdit,
  adsFeeCalculation,
  setAdsFeeCalculation,
  resultAdsFee,
  currency,
  currentUserCurrency,
  convertedTotal,
  openPaymentDialog,
  handleClosePayment,
  isPaymnetCalculator,
  setIsPaymentCalculator,
  onUseMyProfileData, // New prop for auto-fill functionality
}) {
  const { t } = useTranslation();
  const { profileData } = useSelector((state) => state.profile);
  const isAdmin = profileData?.userType === "admin";

  const hasCallToAction = adField?.some(
    (field) => field?.id === "callToAction"
  );
  const dispatch = useDispatch();

  // Get user's country from profile or IP location
  const userCountry = useMemo(() => {
    return profileData?.country?.name || 'all';
  }, [profileData]);

  const handleSave = () => {
    const currentAdType = adField.find(f => f.id === "adType")?.value;
    
    // Validate all required fields before saving
    const missingField = adField.find(
      (field) => {
        // Check if field should be shown
        if (field.show && !field.show({ adType: currentAdType })) {
          return false;
        }
        
        // Check if field is required (handle function or boolean)
        const isRequired = typeof field?.validation?.required === 'function' 
          ? field.validation.required({ adType: currentAdType })
          : field?.validation?.required || field?.required;
          
        return isRequired &&
          (!field.value ||
            (Array.isArray(field.value) && field.value.length === 0) ||
            (typeof field.value === "string" && field.value.trim() === ""));
      }
    );
    if (missingField) {
      dispatch(
        setAlert({
          show: true,
          type: "error",
          message: `Please fill the required field: ${
            missingField.label || missingField.title
          }`,
        })
      );
      return;
    }
    // Save changes to database
    onSave?.(adField);
  };

  const handleCancel = () => {
    // Reset form fields to initial values
    onCancel?.();
  };

  useEffect(() => {
    const displayField = adField?.find(
      (field) => field?.id === "displayOnDashboard"
    );
    if (displayField) {
      setIsPaymentCalculator(displayField.value || "");
    }
  }, [adField, setIsPaymentCalculator]);

  // Handle automatic fee calculation
  const handleFeeCalculate = useCallback(
    async ({ numberOfDays, reach, startDate, endDate }) => {
      try {
        // Update the ads fee calculation state
        setAdsFeeCalculation({
          nunberOfDays: numberOfDays,
          professionalTypesLength: reach,
        });

        // You can also call your existing API here if needed
        // const response = await postAdsCalculatefee({
        //   startDate,
        //   endDate,
        //   totalNumberOfProfessionalTypes: reach,
        // });
      } catch (error) {
        console.error('Error calculating fee:', error);
      }
    },
    [setAdsFeeCalculation]
  );

  const renderFormFields = (field) => {
    if (!field) return null;

    // Check if field should be visible based on its show rule
    if (
      field.show &&
      !field.show({ adType: adField.find((f) => f.id === "adType")?.value })
    ) {
      return null;
    }

    const currentAdType = adField.find(f => f.id === "adType")?.value;
    const isRequired = typeof field?.validation?.required === 'function' 
      ? field.validation.required({ adType: currentAdType })
      : field?.validation?.required || field?.required;

    return (
      <Box key={field.id} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {/* Left side - Title */}
          <Grid item xs={6}>
            <Stack direction="row" spacing={0.5} alignItems="flex-start">
              <MuiTypography variant="h5" sx={{ pt: 1 }}>
                {field?.label || field?.title}
              </MuiTypography>
              {isRequired && (
                <MuiTypography sx={{ color: "error.main", pt: 1 }}>
                  *
                </MuiTypography>
              )}
            </Stack>
          </Grid>

          {/* Right side - Form Field */}
          <Grid item xs={6}>
            <FormFields
              id={field?.id}
              placeholder={field?.placeholder}
              value={field?.value}
              options={field?.options}
              onValueChange={onValueChange}
              type={field?.type}
              multipleFiles={field?.multipleFiles}
              fileTypes={field?.fileTypes}
              showTitle={false}
              isAssets={field?.isAssets}
              isLogo={field?.isLogo}
              disabled={
                field?.id === "professionalType" && field?.value?.length > 60
              }
              shouldUploadVerifyExplicit={false}
            />

            {field?.child?.show && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mt: 2 }}
              >
                <Box>
                  <MuiTypography variant="h5">
                    {t("ad.start_date")}
                  </MuiTypography>
                  <MuiDatePickerBox
                    id={field.id}
                    onDateChange={(id, value) =>
                      onDateValueChange(id, value, 0)
                    }
                    value={field.child.data[0].value}
                  />
                </Box>

                <Box>
                  <MuiTypography variant="h5">{t("ad.end_date")}</MuiTypography>
                  <MuiDatePickerBox
                    id={field?.id}
                    onDateChange={(id, value) =>
                      onDateValueChange(id, value, 1)
                    }
                    value={field?.child.data[1].value}
                    disabled={!field?.child.data[0].value}
                    minDate={dayjs(field?.child.data[0].value).add(1, "day")}
                  />
                </Box>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPaymentCalculator = () => {
    if (isAdmin) return null;

    const selectedAdType = adField.find((f) => f.id === "adType")?.value;

    // Hide calculator for learning solutions in production
    if (selectedAdType === "learningSolution" && import.meta.env.VITE_NODE_ENV === 'production') return null;

    // For non-learning solutions, always show calculator
    if (selectedAdType !== "learningSolution") {
      return (
        <EnhancedPriceCalculator
          adField={adField}
          resultAdsFee={resultAdsFee}
          currency={currency}
          currentUserCurrency={currentUserCurrency}
          convertedTotal={convertedTotal}
          userCountry={userCountry}
          onFeeCalculate={handleFeeCalculate}
          t={t}
        />
      );
    }

    // For learning solutions in development, show only when displayOnDashboard = "yes"
    // This code should never execute in production due to early return above
    const shouldShowCalculator = selectedAdType === "learningSolution" && 
                                 import.meta.env.VITE_NODE_ENV !== 'production' && 
                                 isPaymnetCalculator === "yes";
    if (!shouldShowCalculator) return null;

    return (
      <EnhancedPriceCalculator
        adField={adField}
        resultAdsFee={resultAdsFee}
        currency={currency}
        currentUserCurrency={currentUserCurrency}
        convertedTotal={convertedTotal}
        userCountry={userCountry}
        onFeeCalculate={handleFeeCalculate}
        t={t}
      />
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        my: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 3,
          pb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h2">{t("ad.tabs.basic_information")}</Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "normal",
            }}
          >
            {t("ad.tabs.basic_info_subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {/* Show "Use My Profile Data" button only for profile ad type */}
          {adField.find(f => f.id === "adType")?.value === "profile" && !isEdit && onUseMyProfileData && (
            <Button
              variant="outlined"
              onClick={onUseMyProfileData}
              sx={{
                mr: 1,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              {t("ad.use_my_profile_data", "Use My Profile Data")}
            </Button>
          )}
          <PreviewButton onClick={onAdPreview} />
          <SaveCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            label={hasCallToAction ? t("common.submit") : t("common.next")}
          />
        </Box>
      </Box>
      <Divider sx={{ mb: 4 }} />
      <MuiTypography variant="h2">
        {!isEdit && (adField.find(f => f.id === "adType")?.value === "learningSolution" 
          ? t("learning.create_idea", "Create an Idea") 
          : t("ad.create_ad"))}
      </MuiTypography>
      <Box sx={{ mt: 3, mb: 4 }}>
        {adField?.map((field) => renderFormFields(field))}
      </Box>
      
      {renderPaymentCalculator()}

      <Box
        sx={{ mt: 2, display: "flex", gap: 0.5, justifyContent: "flex-end" }}
      >
        <PreviewButton onClick={onAdPreview} />
        <SaveCancelButtons
          onSave={handleSave}
          onCancel={handleCancel}
          label={hasCallToAction ? t("common.submit") : t("common.next")}
        />
        <Dialog
          open={
            !(adField.find(f => f.id === "adType")?.value === "learningSolution" && import.meta.env.VITE_NODE_ENV === 'production') &&
            isPaymnetCalculator === "yes" ? openPaymentDialog : false
          }
          onClose={(event, reason) => {
            if (reason !== "backdropClick") {
              handleClosePayment();
            }
          }}
          maxWidth="md"
          sx={{
            "&.MuiDialog-root .MuiDialog-container .MuiPaper-root": {
              minWidth: "auto"
            }
          }}
        >
          <DialogContent sx={{ p: 0, minWidth: { xs: 300, sm: 500, md: 600 } }}>
            <PaymentMethodSelector onClose={handleClosePayment} page={"ads"} />
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default DesktopPostAd;