import {
  Autocomplete,
  Box,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  Paper,
  Popper,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import FormFields from "../common/FormFields";
import SubmitButton from "../common/SubmitButton";
import { FIELD_TYPES } from "../../utils/constants/login";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import PaymentMethodSelector from "../common/PaymentMethodSelector";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import moment from "moment-timezone";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FixedSizeList } from "react-window";

function DesktopSetUpWebinar({
  isEdit,
  webinarField,
  onValueChange,
  onDateValueChange,
  onSave,
  setDuration,
  setParticipants,
  duration,
  participants,
  webinarFee,
  handleClosePayment,
  openPaymentDialog,
  convertedTotal,
  currentUserCurrency,
  currency,
  handleStartCall,
  webinars,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [focusedIndex, setFocusedIndex] = useState(null);
  const [dateTime, setDateTime] = useState(null);
  const [timezone, setTimezone] = useState("UTC");

  const handleSave = () => {
    // Validate all required fields before saving
    const missingField = webinarField?.find(
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
          message: `Please fill the required field: ${
            missingField.label || missingField.title
          }`,
        })
      );
      return;
    }
    if (convertedTotal === null) {
      dispatch(
        setAlert({
          show: true,
          type: "error",
          message: `Please provide both Number of Participants and Average Session Duration.`,
        })
      );
      return;
    }
    // Save changes to database
    onSave?.(webinarField);
  };

  const ITEM_HEIGHT = 36;
  const MENU_HEIGHT = 300;

  function VirtualizedListboxComponent(props) {
    const { children, ...other } = props;
    const items = React.Children.toArray(children);

    return (
      <div {...other}>
        <FixedSizeList
          height={MENU_HEIGHT}
          itemCount={items.length}
          itemSize={ITEM_HEIGHT}
          width="100%"
        >
          {({ index, style }) => <div style={style}>{items[index]}</div>}
        </FixedSizeList>
      </div>
    );
  }

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
            {field?.type !== FIELD_TYPES.dates &&
            field?.type !== FIELD_TYPES.timezone ? (
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
              />
            ) : (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {field?.type === FIELD_TYPES.dates && (
                  <DateTimePicker
                    value={dateTime}
                    onAccept={(newValue) => {
                      if (!newValue || !newValue.isValid()) return;
                      setDateTime(newValue);
                      const utcDateTime = moment
                        .tz(newValue.format("YYYY-MM-DD HH:mm"), timezone)
                        .utc()
                        .format("YYYY-MM-DDTHH:mm:ss[Z]");

                      onDateValueChange(field.id, { utcDateTime, timezone }, 3);
                    }}
                    sx={{ width: "100%" }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                )}

                {field?.type === FIELD_TYPES.timezone && (
                  <Autocomplete
                    disablePortal
                    value={field.value?.id || field.value || "UTC"}
                    options={field.options || ["UTC"]}
                    onChange={(e, newValue) => onValueChange(field.id, newValue?.id || newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("webinar.time_zone")}
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                )}
              </LocalizationProvider>
            )}
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
          <Typography variant="h2">{t("webinar.create_call_id")}</Typography>
        </Box>
        {webinars.length > 0 && (
          <SubmitButton onClick={handleStartCall}>
            {t("webinar.start_live_call")}
          </SubmitButton>
        )}
      </Box>
      <Divider sx={{ mb: 4 }} />
      <Box sx={{ mt: 3, mb: 4 }}>
        {webinarField.map((field) => renderFormFields(field))}

        <Box sx={{ mt: 3, mb: 4 }}>
          <Grid container spacing={4}>
            {/* Left Section - Sliders */}
            <Grid item xs={12} md={6}>
              {[
                {
                  label: t("webinar.number_of_participants_per_call"),
                  value: participants,
                  setValue: setParticipants,
                  max: 200,
                },
                {
                  label: t("webinar.average_session_duration_minutes"),
                  value: duration,
                  setValue: setDuration,
                  max: 240,
                },
              ].map((item, index) => (
                <Box key={index} mt={index === 0 ? 0 : 8}>
                  <Typography variant="h6" gutterBottom>
                    {item.label}
                    <span style={{ color: "#d32f2f" }}>*</span>
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Slider
                      value={item.value}
                      onChange={(e, val) => !isEdit && item.setValue(val)}
                      min={0}
                      max={item.max}
                      sx={{ color: "#719C40", flexGrow: 1 }}
                      disabled={isEdit}
                    />
                    <TextField
                  value={item.value === 0 ? "" : item.value}
                  onChange={(e) => {
                    if (isEdit) return;
                    const input = e.target.value;
                    // Allows empty for deleting and writing
                    if (input === "") {
                      item.setValue(0);
                      return;
                    }
                    // Only valid numbers
                    const newVal = Number(input);
                    if (!isNaN(newVal) && newVal >= 0 && newVal <= item.max) {
                      item.setValue(newVal);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  type="number"
                  inputProps={{ min: 0, max: item.max }}
                  size="small"
                  disabled={isEdit}
                  sx={{ width: 80 }}
                />
                  </Box>
                </Box>
              ))}
            </Grid>

            {/* Right Section - Pricing */}
            <Grid item xs={12} md={6}>
              {/* Calculate Price */}
              {(() => {
                const totalParticipantMinutes =
                  webinarFee?.totalParticipants *
                    webinarFee?.totalDurationInMinutes || 0;

                return (
                  <>
                    <Paper
                      elevation={3}
                      sx={{ p: 4, borderRadius: 3, textAlign: "center" }}
                    >
                      <Typography variant="h4" fontWeight="bold">
                        $
                        {(
                          (webinarFee?.fees || 0) +
                          (webinarFee?.servicesFees || 0)
                        ).toFixed(2)}
                        <Typography
                          component="span"
                          variant="body1"
                          color="text.secondary"
                        >
                          &nbsp;price/call.
                        </Typography>
                      </Typography>

                      <Typography variant="h6" mt={2}>
                        {webinarFee?.totalDurationInMinutes?.toLocaleString()}{" "}
                        {t("webinar.call_minutes")}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {totalParticipantMinutes?.toLocaleString() || 0}
                        &nbsp;{t("webinar.participant_minutes")}{" "}
                      </Typography>
                    </Paper>

                    <Box mt={4}>
                      <Typography variant="body1" fontWeight="bold">
                        {t("webinar.video_calls")}
                        <span style={{ float: "right" }}>
                          $
                          {(
                            (webinarFee?.fees || 0) +
                            (webinarFee?.servicesFees || 0)
                          ).toFixed(2)}
                        </span>
                      </Typography>
                      {currency && (
                        <Typography variant="body1" fontWeight="bold">
                          {t("webinar.total_fee")}{" "}
                          {`(${currency || currentUserCurrency})`}
                          <span style={{ float: "right" }}>
                            {convertedTotal || 0}
                          </span>
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {t("webinar.audio_only_quality")}
                        <br />
                        $2.5/
                        {t("webinar.par_participant_minutes")}
                      </Typography>
                    </Box>
                  </>
                );
              })()}
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box
        sx={{ mt: 2, display: "flex", gap: 0.5, justifyContent: "flex-end" }}
      >
        <SubmitButton onClick={handleSave}>
          {isEdit ? t("common.next") : t("common.submit")}
        </SubmitButton>
        <Dialog
          open={openPaymentDialog}
          onClose={handleClosePayment}
          maxWidth="md"
          sx={{
            "&.MuiDialog-root .MuiDialog-container .MuiPaper-root": {
              minWidth: "auto",
            },
          }}
        >
          <DialogContent>
            <PaymentMethodSelector
              onClose={handleClosePayment}
              page={"webinar"}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default DesktopSetUpWebinar;
