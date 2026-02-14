import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import { cloneDeep } from "lodash";

import MuiTypography from "../common/MuiTypography";
import Hours from "./Hours";

const HOURS = {
  daysOfWeek: [],
  startTime: "",
  endTime: "",
};

// Helper function to check if a field is empty
const isEmptyField = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return !value || value.trim() === "";
};

// Helper function to clean empty fields from an hours entry
const cleanEmptyFields = (hour) => {
  if (!hour) return null;

  const cleaned = {
    daysOfWeek: hour.daysOfWeek || [],
    startTime: hour.startTime || "",
    endTime: hour.endTime || "",
  };

  return cleaned;
};

// Helper function to check if an hours entry has any data
const hasAnyData = (hour) => {
  return hour && Object.values(hour).some((value) => !isEmptyField(value));
};

// Helper function to convert hours array to clean array format
const convertHoursToArray = (hoursArray) => {
  return hoursArray.map(cleanEmptyFields);
};

function HoursType({
  id: questionId,
  label,
  onValueChange,
  value,
  validation,
  isProfile,
}) {
  const { t } = useTranslation();
  const [hours, setHours] = useState(() => {
    // Handle initial value
    if (!value) return [{ ...HOURS }];

    // If value is an object with numbered keys (openingHours1, openingHours2, etc.)
    if (typeof value === "object" && !Array.isArray(value)) {
      const entries = Object.entries(value)
        .filter(([key]) => key.startsWith("openingHours"))
        .sort(([a], [b]) => {
          // Sort by number, with base 'openingHours' first
          const numA =
            a === "openingHours" ? 0 : parseInt(a.replace("openingHours", ""));
          const numB =
            b === "openingHours" ? 0 : parseInt(b.replace("openingHours", ""));
          return numA - numB;
        })
        .map(([, val]) => val)
        .filter(hasAnyData); // Filter out entries with no data

      return entries.length > 0 ? entries : [{ ...HOURS }];
    }

    // If value is an array, use it as is
    return Array.isArray(value)
      ? value.length > 0
        ? value
        : [{ ...HOURS }]
      : [{ ...HOURS }];
  });

  useEffect(() => {
    if (!value) {
      setHours([{ ...HOURS }]);
      return;
    }

    // Handle value updates
    if (typeof value === "object" && !Array.isArray(value)) {
      const entries = Object.entries(value)
        .filter(([key]) => key.startsWith("openingHours"))
        .sort(([a], [b]) => {
          const numA =
            a === "openingHours" ? 0 : parseInt(a.replace("openingHours", ""));
          const numB =
            b === "openingHours" ? 0 : parseInt(b.replace("openingHours", ""));
          return numA - numB;
        })
        .map(([, val]) => val)
        .filter(hasAnyData); // Filter out entries with no data

      setHours(entries.length > 0 ? entries : [{ ...HOURS }]);
    } else if (Array.isArray(value)) {
      setHours(value.length > 0 ? value : [{ ...HOURS }]);
    }
  }, [value]);

  function onAddHours() {
    const newHours = [...hours, { ...HOURS }];
    setHours(newHours);

    const hoursArray = convertHoursToArray(newHours);
    onValueChange(questionId, hoursArray);
  }

  function onDeleteHours(index) {
    const newHours = cloneDeep(hours);
    newHours.splice(index, 1);

    // Ensure there's always at least one entry for UI
    if (newHours.length === 0) {
      newHours.push({ ...HOURS });
    }

    setHours(newHours);

    const hoursArray = convertHoursToArray(newHours);
    onValueChange(questionId, hoursArray);
  }

  function onHoursValueChange(id, value, index) {
    const newHours = cloneDeep(hours);
    newHours[index][id] = value;
    setHours(newHours);

    const hoursArray = convertHoursToArray(newHours);
    onValueChange(questionId, hoursArray);
  }

  return (
    <>
      {!isProfile && (
        <MuiTypography variant="h4" sx={{ fontWeight: 500 }}>
          {label}
        </MuiTypography>
      )}

      <Box>
        {hours.map((hour, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Hours
              index={index}
              handleDataChange={onHoursValueChange}
              data={hour}
              validation={validation}
            />
            {hours.length > 1 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  variant="text"
                  color="error"
                  onClick={() => onDeleteHours(index)}
                  size="small"
                  sx={{ color: "error.main" }}
                >
                  {t("onboarding.delete")}
                </Button>
              </Box>
            )}
          </Box>
        ))}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            variant="text"
            startIcon={<AddIcon />}
            onClick={onAddHours}
            size="small"
            sx={{ color: "primary.main" }}
          >
            {t("onboarding.add_more")}
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default HoursType;
