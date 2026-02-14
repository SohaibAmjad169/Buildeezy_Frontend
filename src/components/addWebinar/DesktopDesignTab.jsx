import {
  Box,
  Grid,
  Stack,
  Typography,
  Divider,
  Dialog,
  DialogContent,
  // Dialog,
  // DialogContent,
} from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { FONT_OPTIONS, FONT_MAP } from "../profile/design/DesignTab.constants";
import FormFields from "../common/FormFields";
import PreviewButton from "../profile/design/PreviewButton";
import SaveCancelButtons from "../common/SaveCancelButtons";
import i18next, { t } from "i18next";
import { FIELD_TYPES } from "../../utils/constants/login";
import PaymentMethodSelector from "../common/PaymentMethodSelector";
// import PaymentMethodSelector from "../common/PaymentMethodSelector";
// import { useSelector } from "react-redux";

function DesktopDesignTab({
  onSave,
  onPreview,
  onCancel,
  values,
  onValueChange,
  errors,
  handleClosePayment,
  openPaymentDialog,
}) {
  // const webinarResponse = useSelector((state) => state.webinar.webinarResponse);
  // const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  // const handleClosePayment = () => {
  //   setOpenPaymentDialog(false);
  // };

  const handleSave = () => {
    onSave?.();
    // if (webinarResponse) {
    //   setOpenPaymentDialog(true);
    // }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const renderFormFields = (field) => {
    if (!field) return null;
    // Check if field should be visible based on its show rule
    if (
      field.show &&
      !field.show({
        callToAction: values.find((f) => f.id === "callToAction")?.value,
      })
    ) {
      return null;
    }
    // If it is the source field, use all options
    const isFontField = field.id === "font";
    return (
      <Box key={field.id} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {/* Left side - Title */}
          <Grid item xs={6}>
            <Stack direction={"row"} spacing={0.5} alignItems="flex-start">
              <MuiTypography variant="h5" sx={{ pt: 1 }}>
                {i18next.t(`webinar.design.${field.id}.title`)}
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
                  __html: i18next.t(`webinar.design.${field.id}.span`),
                }}
              />
            )}
          </Grid>
          {/* Right side - Form Field */}
          <Grid item xs={6}>
            <FormFields
              id={field.id}
              // placeholder={i18next.t(`webinar.design.${field.id}.placeholder`, {
              //   defaultValue: field.placeholder,
              // })}
              placeholder={field?.placeholder}
              value={field.value}
              options={isFontField ? FONT_OPTIONS : field.options?.map((opt) => ({
                ...opt,
                label: i18next.t(
                  `webinar.design.${field.id}.options.${opt.id}`,
                  {
                    defaultValue: opt.label,
                  }
                ),
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
                title: i18next.t(`webinar.design.${field.id}.${f.id}.title`),
                placeholder: i18next.t(
                  `webinar.design.${field.id}.${f.id}.placeholder`
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
          <Typography variant="h2">Design</Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "normal",
            }}
          >
            Customize the look and feel of your webinar.
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
          onClose={handleClosePayment}
          fullWidth
          maxWidth="md"
        >
          <DialogContent>
            <PaymentMethodSelector onClose={handleClosePayment} page={"ads"} />
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default DesktopDesignTab;
