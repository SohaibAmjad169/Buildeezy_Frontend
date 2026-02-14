import {
  Box,
  Grid,
  Stack,
  Typography,
  Divider,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import MuiTypography from "../common/MuiTypography";
import FormFields from "../common/FormFields";
import PreviewButton from "../profile/design/PreviewButton";
import SaveCancelButtons from "../common/SaveCancelButtons";
import i18next from "i18next";
import { FIELD_TYPES } from "../../utils/constants/login";
import PaymentMethodSelector from "../common/PaymentMethodSelector";

function DesktopDesignTab({
  adField,
  onPreview,
  onSave,
  onCancel,
  values,
  onValueChange,
  errors,
  openPaymentDialog,
  handleClosePayment,
}) {
  const { t } = useTranslation();

  const handleSave = () => {
    onSave?.(adField);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const renderFormFields = (field) => {
    if (!field) return null;

    const adTypeValue = adField.find((f) => f.id === "adType")?.value;

    if (field.id === "callToAction" && adTypeValue !== "learningSolution") {
      return null;
    }

    return (
      <Box key={field.id} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {/* Left side - Title */}
          <Grid item xs={6}>
            <Stack direction={"row"} spacing={0.5} alignItems="flex-start">
              <MuiTypography variant="h5" sx={{ pt: 1 }}>
                {i18next.t(`ad.design.${field.id}.title`)}
              </MuiTypography>
              {field?.validation?.required && (
                <MuiTypography sx={{ color: "error.main", pt: 1 }}>
                  *
                </MuiTypography>
              )}
            </Stack>
            {field.type === FIELD_TYPES.quillEditor && (
              <MuiTypography
                variant="body2"
                sx={{
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "#667085",
                }}
                dangerouslySetInnerHTML={{
                  __html: i18next.t(`ad.design.${field.id}.subtitle`),
                }}
              />
            )}
          </Grid>

          {/* Right side - Form Field */}
          <Grid item xs={6}>
            <FormFields
              id={field.id}
              // placeholder={i18next.t(`ad.design.${field.id}.placeholder`, {
              //   defaultValue: field.placeholder,
              // })}
              placeholder={field?.placeholder}
              value={field.value}
              options={field.options?.map((opt) => ({
                ...opt,
                label: i18next.t(`ad.design.${field.id}.options.${opt.id}`, {
                  defaultValue: opt.label,
                }),
              }))}
              onValueChange={onValueChange}
              type={field.type}
              validation={{
                ...field.validation,
                error:
                  errors[field.id] ||
                  (field.child &&
                    field.child.show &&
                    field.child.data?.some(
                      (child) => errors[`${field.id}_${child.id}`]
                    )
                    ? i18next.t("errors.field_required")
                    : null),
              }}
              child={field.child}
              fileTypes={field.fileTypes}
              multipleFiles={field.multipleFiles}
              isAssets={field.isAssets}
              isLogo={field.isLogo}
              description={field.description}
              maxSize={field.maxSize}
              mobileConfig={field.mobileConfig}
              fields={field.fields?.map((f) => ({
                ...f,
                title: i18next.t(`ad.design.${field.id}.${f.id}.title`),
                placeholder: i18next.t(
                  `ad.design.${field.id}.${f.id}.placeholder`
                ),
              }))}
            />
          </Grid>
        </Grid>
      </Box>
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
          <Typography variant="h2">{t("marketing.tabs.design")}</Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "normal",
            }}
          >
            {t("marketing.tabs.design_description")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <PreviewButton onClick={onPreview} />
          <SaveCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            label={t("common.submit")}
          />
        </Box>
      </Box>
      <Divider sx={{ mb: 4 }} />
      <Box sx={{ mt: 3, mb: 4 }}>
        {values.map((field) => renderFormFields(field))}
      </Box>
      <Box
        sx={{ mt: 2, display: "flex", gap: 0.5, justifyContent: "flex-end" }}
      >
        <PreviewButton onClick={onPreview} />
        <SaveCancelButtons
          onSave={handleSave}
          onCancel={handleCancel}
          label={t("common.submit")}
        />
        <Dialog
          open={openPaymentDialog}
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
    </Box>
  );
}

export default DesktopDesignTab;
