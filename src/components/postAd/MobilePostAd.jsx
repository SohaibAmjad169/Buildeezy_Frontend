import {
  Box,
  Stack,
  Alert,
  Button,
} from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import RoundButton from "../common/RoundButton";
import FormFields from "../common/FormFields";
import PaginationCard from "../common/PaginationCard";
import ThemeSelect from "../profile/design/ThemeSelect";
import MuiDatePickerBox from "../common/MuiDatePickerBox";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { setAlert } from "../../redux/configSlice";
import { useDispatch } from "react-redux";
import { getLocalStorage, setLocalStorage } from "../../utils/localStorageUtils";
import { MOBILE_AD_DATA } from "../../utils/constants/auth";
import { useSelector } from "react-redux";
import MobilePriceCalculator from "./MobilePriceCalculator";

function MobilePostAd({
  adField,
  page,
  onValueChange,
  onDateValueChange,
  onAdPreview,
  goToPreviousStep,
  goToNextStep,
  handlePageChange,
  t,
  renderField,
  adsFeeCalculation,
  setAdsFeeCalculation,
  resultAdsFee,
  currentUserCurrency,
  currency,
  convertedTotal,
  setIsPaymentCalculator,
  onUseMyProfileData, // New prop for auto-fill functionality
}) {
  // get previous add data from local storage
  const oldAdData = JSON?.parse(getLocalStorage(MOBILE_AD_DATA)) || {};

  const { profileData } = useSelector((state) => state.profile);
  const isAdmin = profileData?.userType === "admin";

  const [values, setValues] = useState(oldAdData);
  const [focusedIndex, setFocusedIndex] = useState(null);
  

  const [showDetails, setShowDetails] = useState(false);


  const dispatch = useDispatch();

  // Get current field values for enhanced calculator
  const durationField = adField.find((f) => f.id === "duration");
  const audienceField = adField.find((f) => f.id === "audience");
  const professionalTypeField = adField.find((f) => f.id === "professionalType");

  const duration = durationField?.value;
  const startDate = durationField?.child?.data?.[0]?.value;
  const endDate = durationField?.child?.data?.[1]?.value;
  const selectedAudience = audienceField?.value || [];
  const selectedProfessions = professionalTypeField?.value || [];

  useEffect(() => {
    // Initialize values from adField
    if (adField[page]) {
      setValues((prev) => {
        if (prev && Object.keys(prev).length > 0) {
          setLocalStorage(MOBILE_AD_DATA, prev, true);
        }
        return {
          ...prev,
          [adField[page].id]: adField[page].value || adField[page].defaultValue,
        };
      });
    }
  }, [page, adField]);

  useEffect(() => {
    const displayField = adField?.find((field) => field?.id === "displayOnDashboard");
    if (displayField) {
      setIsPaymentCalculator(displayField.value || "");
    }
  }, [adField]);



  const handleFieldChange = (fieldId, value) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    onValueChange?.(fieldId, value);
  };


  const renderFormFields = (field) => {
    if (!field) return null;

    // Check if field should be visible based on its show rule
    if (field.show && !field.show({ adType: values.adType })) {
      return null;
    }

    // If renderField prop is provided and returns a component, use it
    if (renderField) {
      const customField = renderField(
        field,
        values[field.id],
        handleFieldChange,
        field.validation?.error
      );
      if (customField) {
        return (
          <Box key={field.id} sx={{ mb: 4 }}>
            <MuiTypography
              variant="h5"
              sx={{
                mb: 1,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
              }}
            >
              {field.title}
              {(() => {
                const currentAdType = values.adType;
                const isRequired = typeof field?.validation?.required === 'function' 
                  ? field.validation.required({ adType: currentAdType })
                  : field?.validation?.required || field?.required;
                return isRequired && (
                  <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
                    *
                  </Box>
                );
              })()}
            </MuiTypography>
            {field.id === "approach" && field?.subtitle && (
              <MuiTypography
                variant="body1"
                sx={{ mb: 2, color: "text.secondary", fontSize: "12px" }}
                dangerouslySetInnerHTML={{ __html: field.subtitle }}
              />
            )}
            {customField}
          </Box>
        );
      }
    }

    // Handle theme selection
    if (field.type === "select" && field.id === "theme") {
      return (
        <Box key={field.id} sx={{ mb: 4 }}>
          <MuiTypography
            variant="h5"
            sx={{
              mb: 1,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            {field.title}
            {(() => {
              const currentAdType = values.adType;
              const isRequired = typeof field?.validation?.required === 'function' 
                ? field.validation.required({ adType: currentAdType })
                : field?.validation?.required || field?.required;
              return isRequired && (
                <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
                  *
                </Box>
              );
            })()}
          </MuiTypography>
          {field.id === "approach" && field?.subtitle && (
            <MuiTypography
              variant="body1"
              sx={{ mb: 2, color: "text.secondary", fontSize: "12px" }}
              dangerouslySetInnerHTML={{ __html: field.subtitle }}
            />
          )}
          <Box sx={{ width: "100%" }}>
            <ThemeSelect
              value={values[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
            {field.validation?.error && (
              <Box sx={{ color: "error.main", mt: 1, fontSize: "0.75rem" }}>
                {field.validation.error}
              </Box>
            )}
          </Box>
        </Box>
      );
    }

    // Handle other field types
    return (
      <Box key={field.id} sx={{ mb: 4 }}>
        <MuiTypography
          variant="h5"
          sx={{ mb: 1, fontWeight: 600, display: "flex", alignItems: "center" }}
        >
          {field.title}
          {(() => {
            const currentAdType = values.adType;
            const isRequired = typeof field?.validation?.required === 'function' 
              ? field.validation.required({ adType: currentAdType })
              : field?.validation?.required || field?.required;
            return isRequired && (
              <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
                *
              </Box>
            );
          })()}
        </MuiTypography>
        {field.id === "approach" && field?.subtitle && (
          <MuiTypography
            variant="body1"
            sx={{ mb: 2, color: "text.secondary", fontSize: "12px" }}
            dangerouslySetInnerHTML={{ __html: field.subtitle }}
          />
        )}
        <FormFields
          id={field?.id}
          placeholder={field?.placeholder}
          value={field.value}
          options={field?.options}
          onValueChange={handleFieldChange}
          type={field?.type}
          multipleFiles={field?.multipleFiles}
          fileTypes={field?.fileTypes}
          showTitle={false}
          isAssets={field?.isAssets}
          isLogo={field?.isLogo}
          fields={field?.fields}
          validation={field?.validation}
          error={field?.validation?.error}
          multiline={field?.multiline}
          rows={field?.rows}
          maxSize={field?.maxSize}
          acceptedFormats={field?.acceptedFormats}
          mobileConfig={field?.mobileConfig}
          disabled={
            field?.id === "professionalType" && field?.value?.length > 60
          }
          shouldUploadVerifyExplicit={false}
        />

        {field?.child?.show && field?.child?.data && (
          <Stack
            direction={"row"}
            alignItems="center"
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Box>
              <MuiTypography variant="h6">{t("ad.start_date")}</MuiTypography>
              <MuiDatePickerBox
                id={field.id}
                onDateChange={(id, value) => onDateValueChange(id, value, 0)}
                value={field.child.data[0]?.value}
              />
            </Box>

            <Box>
              <MuiTypography variant="h6">{t("ad.end_date")}</MuiTypography>
              <MuiDatePickerBox
                id={field?.id}
                onDateChange={(id, value) => onDateValueChange(id, value, 1)}
                value={field?.child?.data[1]?.value}
                disabled={!field?.child?.data[0]?.value}
                minDate={dayjs(field?.child?.data[0]?.value).add(1, "day")}
              />
            </Box>
          </Stack>
        )}
        
        {/* Enhanced Price Calculator - Hidden for learning solutions in production */}
        <MobilePriceCalculator 
          field={field}
          isAdmin={isAdmin}
          selectedAudience={selectedAudience}
          values={values}
          selectedProfessions={selectedProfessions}
          duration={duration}
          startDate={startDate}
          endDate={endDate}
          resultAdsFee={resultAdsFee}
          currency={currency}
          convertedTotal={convertedTotal}
        />
       

        {/* Show info alert when no audience selected */}
        {field?.id === "duration" && !isAdmin && selectedAudience.length === 0 && (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Select audience to see price calculator
          </Alert>
        )}
      </Box>
    );
  };

  const handleNextStep = () => {
    const currentAdType = values.adType;
    
    // Validate all required fields up to and including this page
    const missingField = adField
      .slice(0, page + 1)
      .find(
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
            (!values[field.id] ||
              (Array.isArray(values[field.id]) &&
                values[field.id].length === 0) ||
              (typeof values[field.id] === "string" &&
                values[field.id].trim() === ""));
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
    goToNextStep();
  };

  return (
    <Box
      sx={{
        width: "100%",
        my: 4,
      }}
    >
      {/* Show "Use My Profile Data" button only on first page for profile ad type */}
      {page === 0 && adField[page]?.id === "adType" && adField[page]?.value === "profile" && onUseMyProfileData && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={onUseMyProfileData}
            fullWidth
            sx={{
              textTransform: "none",
              fontWeight: 500,
              py: 1.5,
            }}
          >
            {t("ad.use_my_profile_data", "Use My Profile Data")}
          </Button>
        </Box>
      )}
      <Box sx={{ mt: 3, mb: 4 }}>{renderFormFields(adField[page])}</Box>
      <Box
        sx={{
          mt: 2,
          mb: { xs: 4, sm: 2 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 2 },
          width: "100%",
        }}
      >
        <RoundButton
          variant="outlined"
          onClick={goToPreviousStep}
          sx={{
            width: { xs: "100%", sm: "auto" },
          }}
          disabled={page === 0}
        >
          {t("previous")}
        </RoundButton>
        {page >= adField.length - 1 ? (
          <RoundButton
            onClick={onAdPreview}
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {t("preview")}
          </RoundButton>
        ) : (
          <RoundButton
            onClick={handleNextStep}
            disabled={page >= adField.length - 1}
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {t("next")}
          </RoundButton>
        )}
      </Box>
      {adField[page] && (
        <PaginationCard
          count={adField.length}
          page={page + 1}
          onPageChange={handlePageChange}
          title={adField[page]?.title}
          subtitle={adField[page]?.subtitle}
        />
      )}
    </Box>
  );
}

export default MobilePostAd;