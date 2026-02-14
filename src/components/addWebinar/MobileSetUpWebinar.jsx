import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  Slider,
  TextField,
  Paper,
  Divider,
  MenuItem,
} from "@mui/material";
import RoundButton from "../common/RoundButton";
import PreviewButton from "../profile/design/PreviewButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import PaginationCard from "../common/PaginationCard";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import PaymentMethodSelector from '../common/PaymentMethodSelector';
import MuiSnackbar from '../common/MuiSnackbar';
import { useDispatch } from 'react-redux';
import { setAlert } from '../../redux/configSlice';

function MobileSetUpWebinar({
  isEdit,
  webinarField = [],
  onValueChange,
  onDateValueChange,
  onSave,
  setDuration,
  setParticipants,
  duration,
  participants,
  webinarFee,
  convertedTotal,
  currentUserCurrency,
  currency,
  t,
  openPaymentDialog,
  handleClosePayment,
}) {
  // Build the steps: each field + participants + duration + summary
  const steps = [
    ...webinarField.map((field) => ({ type: "field", field })),
    {
      type: "sliders",
      label: t ? t("ad.price_calculator", "Cost Calculator") : "Cost Calculator",
      subtitle: t ? t("ad.cost_calculator_info", "Based on your selection of number of days and reach, you will see the ad cost here.") : "Based on your selection of number of days and reach, you will see the ad cost here.",
      sliders: [
        { label: t ? t("webinar.number_of_participants_per_call", "Number of Participants") : "Number of Participants", value: participants, setValue: setParticipants, max: 200 },
        { label: t ? t("webinar.average_session_duration_minutes", "Session Duration (min)") : "Session Duration (min)", value: duration, setValue: setDuration, max: 240 },
      ],
    },
    {
      type: "summary",
      label: t ? t("ad.summary", "Summary") : "Summary",
      subtitle: t ? t("ad.summary_info", "Review your webinar details before submitting.") : "Review your webinar details before submitting."
    },
  ];

  // Type guards for steps
  function isFieldStep(step) {
    return step.type === "field" && typeof step.field === "object" && step.field;
  }
  function isSlidersStep(step) {
    return step.type === "sliders" && typeof step.label === "string";
  }
  function isSummaryStep(step) {
    return step.type === "summary" && typeof step.label === "string";
  }
  const [step, setStep] = useState(0);
  const dispatch = useDispatch();

 // Validation and navigation with Global Snackbar
  const handleNext = () => {
    const current = steps[step];
    if (current.type === "field") {
      const field = current.field;
      if (field?.validation?.required && !field.value) {
        dispatch(setAlert({
          show: true,
          type: "warning",
          message: t ? t("webinar.required_field") : "Required field",
          subMessage: "",
        }));
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    const current = steps[step];
    if (current.type === "field") {
      const field = current.field;
      if (field?.validation?.required && !field.value) {
        dispatch(setAlert({
          show: true,
          type: "warning",
          message: t ? t("webinar.required_field") :"Required field",
          subMessage: "",
        }));
        return;
      }
    }
    onSave();
  };

  // Render the current step
  const renderCurrentStep = () => {
    const current = steps[step];
    if (current.type === "field") {
      const field = current.field;
      const label = t ? t(field.label || field.title) : (field.label || field.title);
      const placeholder = t ? t(field.placeholder || "") : (field.placeholder || "");
      if (field.type === "select" && Array.isArray(field.options)) {
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {label}
              {field?.validation?.required && <span style={{ color: "#d32f2f" }}>*</span>}
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={field.value || ""}
              onChange={(e) => onValueChange && onValueChange(field.id, e.target.value)}
              sx={{ mt: 1 }}
              placeholder={placeholder}
            >
              {field.options.map((opt) => (
                <MenuItem key={opt.id || opt.value} value={opt.id || opt.value}>
                  {t ? t(opt.label || opt.value) : (opt.label || opt.value)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      }
      if (field.type === "dates") {
       // Initialize the value as null or valid dayjs
        let dateValue = null;
        if (field.value) {
          // If it's already dayjs, use it; if it's a string, convert it
          if (typeof field.value === "object" && field.value.isValid) {
            dateValue = field.value;
          } else if (typeof field.value === "string") {
            const dayjsObj = dayjs(field.value);
            dateValue = dayjsObj.isValid() ? dayjsObj : null;
          }
        }
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {label}
              {field?.validation?.required && <span style={{ color: "#d32f2f" }}>*</span>}
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={dateValue}
                onChange={(newValue) => onDateValueChange && onDateValueChange(field.id, newValue, 3)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" sx={{ mt: 1 }} />}
              />
            </LocalizationProvider>
          </Box>
        );
      }
      if (field.type === "timezone" && Array.isArray(field.options)) {
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {label}
              {field?.validation?.required && <span style={{ color: "#d32f2f" }}>*</span>}
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={field.value || "UTC"}
              onChange={(e) => onValueChange && onValueChange(field.id, e.target.value)}
              sx={{ mt: 1 }}
              SelectProps={{
                native: false,
                MenuProps: { PaperProps: { style: { maxHeight: 300 } } },
              }}
              placeholder={placeholder}
            >
              {field.options.map((opt) => (
                <MenuItem key={opt.value || opt.id || opt} value={opt.value || opt.id || opt}>
                  {opt.label || opt.value || opt}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      }
      if (field.type === "multipleSelect" && Array.isArray(field.options)) {
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {label}
              {field?.validation?.required && <span style={{ color: "#d32f2f" }}>*</span>}
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              SelectProps={{ multiple: true }}
              value={field.value || []}
              onChange={(e) => onValueChange && onValueChange(field.id, e.target.value)}
              sx={{ mt: 1 }}
            >
              {field.options.map((opt) => (
                <MenuItem key={opt.id || opt.value} value={opt.id || opt.value}>
                  {t ? t(opt.label || opt.value) : (opt.label || opt.value)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      }
      // Default text field
      return (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {label}
            {field?.validation?.required && <span style={{ color: "#d32f2f" }}>*</span>}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={field.value || ""}
            placeholder={placeholder}
            onChange={(e) => onValueChange && onValueChange(field.id, e.target.value)}
            sx={{ mt: 1 }}
          />
        </Box>
      );
    }
    if (current.type === "sliders") {
      return (
        <Box sx={{ mt: 3, mb: 4 }}>
          {current.sliders.map((item, idx) => (
            <Box key={idx} sx={{ mb: idx === 0 ? 4 : 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {item.label} <span style={{ color: "#d32f2f" }}>*</span>
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
        </Box>
      );
    }
    if (current.type === "summary") {
      return (
        <>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              $
              {((webinarFee?.fees || 0) + (webinarFee?.servicesFees || 0)).toFixed(2)}
              <Typography component="span" variant="body2" color="text.secondary">
                &nbsp;{t ? t("webinar.price_per_call") : "price/call"}
              </Typography>
            </Typography>
            <Typography variant="body2" mt={2}>
              {webinarFee?.totalDurationInMinutes?.toLocaleString()} {t ? t("webinar.call_minutes") : "call minutes"}
            </Typography>
            <Typography variant="body2" color="primary">
              {(webinarFee?.totalParticipants * webinarFee?.totalDurationInMinutes || 0).toLocaleString()}&nbsp;{t ? t("webinar.participant_minutes") : "participant minutes"}
            </Typography>
            {currency && (
              <Typography variant="body2" fontWeight="bold" mt={2}>
                {t ? t("webinar.total_fee") : "Total Fee"} ({currency || currentUserCurrency})
                <span style={{ float: "right" }}>{convertedTotal || 0}</span>
              </Typography>
            )}
          </Paper>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body1">
              {t ? t("webinar.video_calls") : "Video Calls"}
              <span style={{ float: "right" }}>
                ${((webinarFee?.fees || 0) + (webinarFee?.servicesFees || 0)).toFixed(2)}
              </span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t ? t("webinar.audio_only_quality") : "Audio Only Quality"}<br />
              $2.5/{t ? t("webinar.par_participant_minutes") : "Per 1000 participant minutes"}
            </Typography>
          </Box>
        </>
      );
    }
    return null;
  };

  // Navigation buttons similar to MobileDesignTab
  const renderNavigation = () => (
    <Box
      sx={{
        mt: 2,
        mb: { xs: 4, sm: 2 },
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 1,
        width: "100%",
      }}
    >
      {/* Preview button in intermediate steps and last step */}
      {step > 0 && (
        <RoundButton
          variant="outlined"
          onClick={() => setStep(step - 1)}
          sx={{ minWidth: 120, fontWeight: 500, fontSize: 16, borderRadius: 2 }}
          disabled={step === 0}
        >
          {t ? t("common.preview") : "Preview"}
        </RoundButton>
      )}
      {/* Next button in intermediate steps */}
      {step < steps.length - 1 && (
        <RoundButton
          color="primary"
          onClick={handleNext}
          disabled={step >= steps.length - 1}
          sx={{ minWidth: 120, fontWeight: 500, fontSize: 16, borderRadius: 2, ml: 1 }}
        >
          {t ? t("common.next") : "Next"}
        </RoundButton>
      )}
     {/* Submit button in the last step */}
      {step === steps.length - 1 && (
        <RoundButton
          color="primary"
          onClick={handleSubmit}
          sx={{ minWidth: 120, fontWeight: 500, fontSize: 16, borderRadius: 2, ml: 1 }}
        >
          {t ? t("common.submit") : "Submit"}
        </RoundButton>
      )}
    </Box>
  );

  return (
  <Box sx={{ width: "100%", my: 2 }}>
    <MuiSnackbar />
      <Typography variant="h5" sx={{ mb: 2 }}>
        {(() => {
          const current = steps[step];
          if (current.type === "field" && Object.prototype.hasOwnProperty.call(current, 'field')) {
            const field = current.field;
            return t ? t(field.label || field.title) : (field.label || field.title);
          }
          if (current.type === "sliders" && Object.prototype.hasOwnProperty.call(current, 'label')) {
            return current.label;
          }
          return "";
        })()}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {renderCurrentStep()}
      {renderNavigation()}
      <PaginationCard
        count={steps.length}
        page={step + 1}
        onPageChange={(newPage) => setStep(newPage - 1)}
        title={
          isSlidersStep(steps[step]) ? steps[step].label :
          isSummaryStep(steps[step]) ? steps[step].label :
          isFieldStep(steps[step]) ? (t ? t(steps[step].field.label || steps[step].field.title) : (steps[step].field.label || steps[step].field.title)) :
          ""
        }
        subtitle={
          isSlidersStep(steps[step]) ? steps[step].subtitle :
          isSummaryStep(steps[step]) ? steps[step].subtitle :
          isFieldStep(steps[step]) ? (t ? t(steps[step].field.subtitle || "") : (steps[step].field.subtitle || "")) :
          ""
        }
        subtitleHtml={""}
      />
     {/* Payment method same as Desktop */}
      {typeof openPaymentDialog !== 'undefined' && typeof handleClosePayment === 'function' && (
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
      )}
    </Box>
  );
}

export default MobileSetUpWebinar;