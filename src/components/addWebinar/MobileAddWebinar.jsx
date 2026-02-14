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
import { SETUP_QUESTIONS } from "../../utils/constants/webinar";
import ThemeSelect from "../profile/design/ThemeSelect";
import MuiDatePickerBox from "../common/MuiDatePickerBox";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { setAlert } from "../../redux/configSlice";
import { useDispatch, useSelector } from "react-redux";
import { getLocalStorage, setLocalStorage, removeLocalStorage } from "../../utils/localStorageUtils";
import { MOBILE_AD_DATA } from "../../utils/constants/auth";
import MobilePriceCalculator from "../postAd/MobilePriceCalculator";

function MobileAddWebinar({
  webinarField = [],
  page = 0,
  onValueChange,
  onDateValueChange,
  onWebinarPreview,
  goToPreviousStep,
  goToNextStep,
  handlePageChange,
  t = (key) => key, // fallback seguro si i18n no está listo
  renderField,
  adsFeeCalculation,
  setAdsFeeCalculation,
  resultAdsFee,
  currentUserCurrency,
  currency,
  convertedTotal,
  setIsPaymentCalculator,
  onUseMyProfileData,
}) {
  const dispatch = useDispatch();

  // --- Estado inicial desde localStorage ---
  const oldAdData = JSON?.parse(getLocalStorage(MOBILE_AD_DATA)) || {};
  const { profileData } = useSelector((state) => state.profile || {});
  const isAdmin = profileData?.userType === "admin";

  const [values, setValues] = useState(oldAdData);

  // Campos clave (con fallback)
  const durationField = webinarField.find((f) => f?.id === "duration") || {};
  const audienceField = webinarField.find((f) => f?.id === "audience") || {};
  const professionalTypeField =
    webinarField.find((f) => f?.id === "professionalType") || {};

  const duration = durationField?.value;
  const startDate = durationField?.child?.data?.[0]?.value;
  const endDate = durationField?.child?.data?.[1]?.value;
  const selectedAudience = Array.isArray(audienceField?.value)
    ? audienceField.value
    : [];
  const selectedProfessions = Array.isArray(professionalTypeField?.value)
    ? professionalTypeField.value
    : [];

 // Save to localStorage when values or payment status change
  useEffect(() => {
    if (Object.keys(values).length > 0) {
      const stored = JSON.parse(getLocalStorage(MOBILE_AD_DATA) || '{}');
      const isPaymentDone = stored.isPaymentDone || false;
      setLocalStorage(MOBILE_AD_DATA, { ...values, isPaymentDone }, true);
    }
  }, [values]);

 // Function to mark the payment as made
  const setPaymentDone = () => {
    setLocalStorage(MOBILE_AD_DATA, { ...values, isPaymentDone: true }, true);
  };

 // Function to clear the localStorage from the eraser
  const clearWebinarDraft = () => {
    removeLocalStorage(MOBILE_AD_DATA);
  };

  // Restore values and payment status from localStorage on mount or when fields change
  useEffect(() => {
    const currentField = webinarField[page];
    if (!currentField || !currentField.id) return;

    const { id, value, defaultValue } = currentField;
    let localValue, isPaymentDone = false;
    try {
      const stored = JSON.parse(getLocalStorage(MOBILE_AD_DATA) || '{}');
      localValue = stored[id];
      isPaymentDone = stored.isPaymentDone || false;
    } catch (e) {
      localValue = undefined;
      isPaymentDone = false;
    }

    setValues((prev) => ({
      ...prev,
      [id]:
        localValue !== undefined
          ? localValue
          : value !== undefined
          ? value
          : prev[id] !== undefined
          ? prev[id]
          : defaultValue !== undefined
          ? defaultValue
          : "",
      isPaymentDone,
    }));

    // Si el pago ya está hecho, avanzar automáticamente al siguiente paso si estamos en el paso de pago
    if (isPaymentDone && typeof goToNextStep === 'function') {
      // Detecta si el paso actual es el de pago (ajusta el id según tu flujo)
      if (currentField.id === 'payment' || currentField.id === 'adsFeeCalculation') {
        goToNextStep();
      }
    }
  }, [page, webinarField, goToNextStep]);
  // Hook para limpiar localStorage al cerrar sesión (puedes llamarlo desde el logout real)
  // useEffect(() => {
  //   // Si detectas logout, ejecuta:
  //   clearWebinarDraft();
  // }, [/* dependencia de logout */]);

  // Ejemplo: limpiar localStorage al finalizar el proceso (llama clearWebinarDraft() después de pago o submit)


 // Update setIsPaymentCalculator when displayOnDashboard changes
  useEffect(() => {
    const displayField = webinarField.find(
      (field) => field?.id === "displayOnDashboard"
    );
    if (displayField && typeof setIsPaymentCalculator === "function") {
      setIsPaymentCalculator(displayField.value || "");
    }
  }, [webinarField, setIsPaymentCalculator]);

  const handleFieldChange = (fieldId, value) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    onValueChange?.(fieldId, value);
  };


  useEffect(() => {
    const currentField = webinarField[page];
    if (currentField && currentField.id && values[currentField.id] !== undefined && typeof onValueChange === 'function') {
      onValueChange(currentField.id, values[currentField.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, page]);

 

    // --- Render each field safely ---
    const renderFormFields = (field) => {
      // Check if this field was already completed in setup
      const isSetupField = SETUP_QUESTIONS.some(q => q.id === field.id);
      if (!field || !field.id) return null;

      const currentAdType = values.adType;

     // Hide if field.show indicates so
      if (typeof field.show === "function" && !field.show({ adType: currentAdType })) {
        return null;
      }

      // Support for custom renderField
      if (typeof renderField === "function") {
        try {
          const customField = renderField(
            field,
            values[field.id],
            handleFieldChange,
            field.validation?.error
          );
          if (customField) {
            const isRequired =
              typeof field?.validation?.required === "function"
                ? field.validation.required({ adType: currentAdType })
                : field?.validation?.required || field?.required;

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
                  {field.title || "Untitled"}
                  {isRequired && (
                    <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>*</Box>
                  )}
                </MuiTypography>

                {field.id === "approach" && field.subtitle && (
                  <MuiTypography
                    variant="body1"
                    sx={{ mb: 2, color: "text.secondary", fontSize: "12px" }}
                    dangerouslySetInnerHTML={{ __html: field.subtitle }}
                    children={null}
                  />
                )}

                {customField}
              </Box>
            );
          }
        } catch (err) {
          console.error("Error en renderField personalizado:", err);
        }
      }

      // Special case: ThemeSelect
      if (field.type === "select" && field.id === "theme") {
        const isRequired =
          typeof field?.validation?.required === "function"
            ? field.validation.required({ adType: currentAdType })
            : field?.validation?.required || field?.required;

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
              {field.title || "Theme"}
              {isRequired && (
                <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>*</Box>
              )}
            </MuiTypography>

            <ThemeSelect
              value={values[field.id] || ""}
              onChange={(value) => handleFieldChange(field.id, value)}
            />

            {field.validation?.error && (
              <Box sx={{ color: "error.main", mt: 1, fontSize: "0.75rem" }}>
                {field.validation.error}
              </Box>
            )}
          </Box>
        );
      }

      // Dynamic required validation
      const isRequired =
        typeof field?.validation?.required === "function"
          ? field.validation.required({ adType: currentAdType })
          : field?.validation?.required || field?.required;

      // Only show the cost calculator in the duration field and if it has a value
      const showCostCalculator =
        field.id === "duration" &&
        (field.value !== undefined && field.value !== null && field.value !== "");

      return (
        <Box
          key={field.id}
          sx={{
            mb: 4,
            opacity: isSetupField ? 0.6 : 1,
            pointerEvents: isSetupField ? "none" : "auto",
            transition: "opacity 0.2s",
            backgroundColor: isSetupField ? "#f5f5f5" : "inherit",
            borderRadius: isSetupField ? 2 : 0,
            color: isSetupField ? "#a0a0a0" : "inherit",
          }}
        >
          <MuiTypography
            variant="h5"
            sx={{
              mb: 1,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}
          >
            {field.title || "No Title"}
            {isRequired && (
              <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>*</Box>
            )}
          </MuiTypography>

          {/* Subtitle only for 'approach' */}
          {field.id === "approach" && field.subtitle && (
            <MuiTypography
              variant="body1"
              sx={{ mb: 2, color: "text.secondary", fontSize: "12px" }}
              dangerouslySetInnerHTML={{ __html: field.subtitle }}
            />
          )}

          {/* FormField with value controlled from `values` */}
          <FormFields
            id={field.id}
            placeholder={field.placeholder}
            value={values[field.id] ?? ""} 
            options={field.options}
            onValueChange={handleFieldChange}
            type={field.type}
            multipleFiles={field.multipleFiles}
            fileTypes={field.fileTypes}
            showTitle={false}
            isAssets={field.isAssets}
            isLogo={field.isLogo}
            fields={field.fields}
            validation={field.validation}
            multiline={field.multiline}
            rows={field.rows}
            maxSize={field.maxSize}
            acceptedFormats={field.acceptedFormats}
            mobileConfig={field.mobileConfig}
            disabled={
              ["id", "adType", "headline", "description"].includes(field?.id) ||
              (field.id === "professionalType" &&
                Array.isArray(values[field.id]) &&
                values[field.id].length > 60)
            }
            shouldUploadVerifyExplicit={false}
          />

          {/* Dates: Start and End */}
          {field.child?.show &&
            Array.isArray(field.child.data) &&
            field.child.data.length >= 2 && (
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <MuiTypography variant="h6" sx={{}}>
                    {t("webinar.start_date")}
                  </MuiTypography>
                  <MuiDatePickerBox
                    id={field.id}
                    value={field.child.data[0]?.value ? dayjs(field.child.data[0].value) : null}
                    onDateChange={(id, value) => onDateValueChange(id, value, 0)}
                    sx={{}}
                  />
                </Box>
                <Box>
                  <MuiTypography variant="h6" sx={{}}>
                    {t("webinar.end_date")}
                  </MuiTypography>
                  <MuiDatePickerBox
                    id={field.id}
                    value={field.child.data[1]?.value ? dayjs(field.child.data[1].value) : null}
                    onDateChange={(id, value) => onDateValueChange(id, value, 1)}
                    disabled={!field.child.data[0]?.value}
                    minDate={field.child.data[0]?.value ? dayjs(field.child.data[0].value).add(1, "day") : undefined}
                    sx={{}}
                  />
                </Box>
              </Stack>
            )}

          {/* Show cost calculator only in the duration step and if it has a value */}
          {showCostCalculator && (
            <>
              <MuiTypography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
                {t("ad.price_calculator")}
              </MuiTypography>
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
            </>
          )}

          {/* Informational alert if no audience is selected */}
          {field.id === "duration" && !isAdmin && selectedAudience.length === 0 && (
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              {t("ad.select_audience_to_see_price_calculator")}
            </Alert>
          )}
        </Box>
      );
    };

  // --- Validation before moving forward ---
  const handleNextStep = () => {
    const currentAdType = values.adType;

    for (let i = 0; i <= page; i++) {
      const field = webinarField[i];
      if (!field) continue;

      // Skip if it shouldn't be shown
      if (typeof field.show === "function" && !field.show({ adType: currentAdType }))
        continue;

      const isRequired =
        typeof field?.validation?.required === "function"
          ? field.validation.required({ adType: currentAdType })
          : field?.validation?.required || field?.required;

      if (!isRequired) continue;

      const value = values[field.id];

      if (
        value == null ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "")
      ) {
        dispatch(
          setAlert({
            show: true,
            type: "error",
            message: t("ad.fill_required_field"),
          })
        );
        return;
      }
    }

    goToNextStep();
  };

  const currentPageField = webinarField[page];

  // --- Final Render ---
  return (
    <Box sx={{ width: "100%", my: 4 }}>
      {/* Button "Use My Profile Data" only on first page and if it's profile */}
      {page === 0 &&
        currentPageField?.id === "adType" &&
        currentPageField?.value === "profile" &&
        typeof onUseMyProfileData === "function" && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              onClick={onUseMyProfileData}
              fullWidth
              sx={{ textTransform: "none", fontWeight: 500, py: 1.5 }}
            >
              {t("ad.use_my_profile_data")}
            </Button>
          </Box>
        )}

     {/* Render the current field or error message */}
      {currentPageField ? (
        <Box sx={{ mt: 3, mb: 4 }}>{renderFormFields(currentPageField)}</Box>
      ) : (
        <Alert severity="warning" sx={{ m: 2 }}>
          {t("common.step_not_found")}
        </Alert>
      )}

      {/* Navigation buttons */}
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
          sx={{ width: { xs: "100%", sm: "auto" } }}
          disabled={page === 0}
          isLoading={false}
          color="primary"
        >
          {t("previous")}
        </RoundButton>

        {page >= webinarField.length - 1 ? (
          <RoundButton
            onClick={onWebinarPreview}
            sx={{ width: { xs: "100%", sm: "auto" } }}
            disabled={false}
            isLoading={false}
            color="primary"
          >
            {t("preview")}
          </RoundButton>
        ) : (
          <RoundButton
            onClick={handleNextStep}
            sx={{ width: { xs: "100%", sm: "auto" } }}
            disabled={false}
            isLoading={false}
            color="primary"
          >
            {t("next")}
          </RoundButton>
        )}
      </Box>

      {/* Pagination */}
      {currentPageField && (
        <PaginationCard
          count={webinarField.length}
          page={page + 1}
          onPageChange={handlePageChange}
          title={currentPageField.title}
          subtitle={currentPageField.subtitle}
          subtitleHtml={null}
        />
      )}
    </Box>
  );
}

export default MobileAddWebinar;