import { Box, Grid, Stack, Typography, Divider } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import FormFields from "../common/FormFields";
import MuiDatePickerBox from "../common/MuiDatePickerBox";
import dayjs from "dayjs";
import PreviewButton from "../profile/design/PreviewButton";
import SaveCancelButtons from "../common/SaveCancelButtons";
import { setAlert } from "../../redux/configSlice";
import { useDispatch } from "react-redux";
import { useState } from "react";
import PaymentMethodSelector from "../common/PaymentMethodSelector";
import EnhancedPriceCalculator from "../postAd/EnhancedPriceCalculator";

function DesktopAddWebinar({
  setupField,
  webinarField,
  onValueChange,
  onDateValueChange,
  onWebinarPreview,
  onSave,
  onCancel,
  t,
  isEdit,
  activeTab,
  resultAdsFee,
  adsFeeCalculation,
  setAdsFeeCalculation,
  currency,
  currentUserCurrency,
  convertedTotal,
  editedConvertedTotal
}) {

  const dispatch = useDispatch()

  const [focusedIndex, setFocusedIndex] = useState(null);

  // const handleSave = () => {
  //   // Save changes to database
  //   onSave?.(webinarField);
  // };

  const handleSave = () => {
    // Validate all required fields before saving
    const missingField = webinarField.find(
      (field) =>
        field?.validation?.required &&
        (!field.value ||
          (Array.isArray(field.value) && field.value.length === 0) ||
          (typeof field.value === "string" && field.value.trim() === ""))
    );
    if (missingField) {
      dispatch(
        setAlert({
          show: true,
          type: "error",
          message: `Please fill the required field: ${missingField.label || missingField.title
            }`,
        })
      );
      return;
    }
    // Save changes to database
    onSave?.(webinarField);
  };

  const handleCancel = () => {
    // Reset form fields to initial values
    onCancel?.();
  };

  // Use setup values as initial values
  // const mergeSetupValues = webinarField.map((field) => {
  //   const foundSetupField = setupField.find(
  //     (sf) => sf.id?.toLowerCase() === `setup${field.id?.toLowerCase()}`
  //   );

  //   if (foundSetupField) {
  //     return { ...field, value: foundSetupField.value };
  //   }  

  //   return field;
  // });

  const renderFormFields = (field) => {
    if (!field) return null;

    // Check if field should be visible based on its show rule
    if (
      field.show &&
      !field.show({
        adType: webinarField.find((f) => f.id === "adType")?.value,
      })
    ) {
      return null;
    }

    return (
      <Box key={field.id} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {/* Left side - Title */}
          <Grid item xs={6}>
            <Stack direction={"row"} spacing={0.5} alignItems="flex-start">
              <MuiTypography variant="h5" sx={{ pt: 1 }}>
                {field?.label || field?.title}
              </MuiTypography>
              {field?.validation?.required && (
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
              // disabled={field?.id === "id" ? true : false}
              disabled={
                ["id", "adType", "headline", "description"].includes(field?.id) ||
                (field?.id === "professionalType" && field?.value?.length > 60)
              }
            />
            {field?.child?.show && (
              <Stack
                direction={"row"}
                alignItems="center"
                spacing={2}
                sx={{ mt: 2 }}
              >
                <Box>
                  <MuiTypography variant="h5">
                    {t("webinar.start_date")}
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
                  <MuiTypography variant="h5">
                    {t("webinar.end_date")}
                  </MuiTypography>
                  <MuiDatePickerBox
                    id={field?.id}
                    onDateChange={(id, value) =>
                      onDateValueChange(id, value, 1)
                    }
                    value={field?.child.data[1].value}
                    // disabled={!field?.child.data[0].value}
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
    // Only show if the duration field has a value
    const durationField = webinarField.find(f => f.id === "duration");
    const hasDuration = durationField && durationField.value !== undefined && durationField.value !== null && durationField.value !== "";
    if (!hasDuration) return null;

    return (
      <EnhancedPriceCalculator
        adField={webinarField}
        resultAdsFee={resultAdsFee}
        currency={currency}
        currentUserCurrency={currentUserCurrency}
        convertedTotal={convertedTotal}
        userCountry={null}
        onFeeCalculate={null}
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
      {" "}
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
          <Typography variant="h2">Basic Information</Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "normal",
            }}
          >
            Input basic things that need to be set on your webinar.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <PreviewButton onClick={onWebinarPreview} />
          <SaveCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            label={activeTab === 2 ? t("common.save") : t("common.next")}
          />
        </Box>
      </Box>
      <Divider sx={{ mb: 4 }} />
      <MuiTypography variant="h2">
        {!isEdit && t("webinar.create_webinar")}
      </MuiTypography>
      <Box sx={{ mt: 3, mb: 4 }}>
        {/* {mergeSetupValues.map((field) => renderFormFields(field))} */}
        {webinarField.map((field) => renderFormFields(field))}
      </Box>
      {renderPaymentCalculator()}
      <Box
        sx={{ mt: 2, display: "flex", gap: 0.5, justifyContent: "flex-end" }}
      >
        <PreviewButton onClick={onWebinarPreview} />
        <SaveCancelButtons
          onSave={handleSave}
          onCancel={handleCancel}
          // label={t("common.save")}
          label={activeTab === 2 ? t("common.save") : t("common.next")}
        />
      </Box>
    </Box>
  );
}

export default DesktopAddWebinar;
