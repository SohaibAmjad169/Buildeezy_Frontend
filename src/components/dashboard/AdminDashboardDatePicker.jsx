import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import { DateRange } from "react-date-range";
import "react-date-range/dist/theme/default.css";
import { useState, useEffect, useRef } from "react";
import { useThemeMode } from "../../context/ThemeContext";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { enUS } from "date-fns/locale";
import {
  Box,
  InputBase,
  Paper,
  Typography,
  Button,
  useTheme,
} from "@mui/material";

const AdminDashboardDatePicker = ({ onChange, initialStart, initialEnd }) => {
  const { mode } = useThemeMode();
  const theme = useTheme();

  const [state, setState] = useState([
    {
      startDate: initialStart || new Date(),
      endDate: initialEnd || new Date(),
      key: "selection",
    },
  ]);

  const [tempState, setTempState] = useState([
    {
      startDate: initialStart || new Date(),
      endDate: initialEnd || new Date(),
      key: "selection",
    },
  ]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectionStep, setSelectionStep] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (initialStart && initialEnd) {
      const newState = {
        startDate: initialStart,
        endDate: initialEnd,
        key: "selection",
      };
      setState([newState]);
      setTempState([newState]);
    }
  }, [initialStart, initialEnd]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        handleCancel();
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCalendar]);

  const handleChange = (item) => {
    const newSelection = item.selection;

    if (selectionStep === 0 || newSelection.startDate > tempState[0].endDate) {
      setTempState([
        {
          startDate: newSelection.startDate,
          endDate: newSelection.startDate,
          key: "selection",
        },
      ]);
      setSelectionStep(1);
    } else {
      setTempState([
        {
          startDate: tempState[0].startDate,
          endDate: newSelection.endDate,
          key: "selection",
        },
      ]);
      setSelectionStep(2);
    }
  };

  const handleApply = () => {
    setState(tempState);
    onChange?.(tempState[0].startDate, tempState[0].endDate);
    setShowCalendar(false);
    setSelectionStep(0);
  };

  const handleCancel = () => {
    setTempState(state);
    setShowCalendar(false);
    setSelectionStep(0);
  };

  const handleInputClick = () => {
    setShowCalendar(!showCalendar);
    setSelectionStep(0);
    setTempState(state);
  };

  const getSelectionText = () => {
    switch (selectionStep) {
      case 0:
        return "Select start date";
      case 1:
        return "Select end date";
      case 2:
        return "Range selected";
      default:
        return "Select date range";
    }
  };

  const isRangeValid = () => {
    return (
      tempState[0].startDate &&
      tempState[0].endDate &&
      tempState[0].startDate <= tempState[0].endDate
    );
  };

  const bgColor = mode === "dark" ? "#121212" : "#ffffff";
  const borderColor = mode === "dark" ? "#333" : "#e0e0e0";
  const textColor = mode === "dark" ? "#e0e0e0" : "#333";

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
      ref={containerRef}
    >
      <Typography variant="body2" fontWeight={500}>
        Custom
      </Typography>

      <Box sx={{ position: "relative", width: "250px" }}>
        <CalendarMonthIcon
          sx={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: mode === "dark" ? "#ccc" : "#888",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <InputBase
          value={`${format(state[0].startDate, "MM/dd/yyyy")} - ${format(
            state[0].endDate,
            "MM/dd/yyyy"
          )}`}
          readOnly
          onClick={handleInputClick}
          sx={{
            padding: "8px 12px 8px 40px",
            width: "100%",
            borderRadius: "4px",
            border: showCalendar
              ? `1px solid ${theme.palette.primary.main}`
              : `1px solid ${borderColor}`,
            backgroundColor: bgColor,
            color: textColor,
            fontSize: "0.95rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: theme.palette.primary.main,
            },
          }}
        />
      </Box>

      {showCalendar && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            top: "48px",
            right: 0,
            zIndex: 1000,
            border: `1px solid ${borderColor}`,
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: bgColor,
            color: textColor,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${borderColor}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: bgColor,
            }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {getSelectionText()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectionStep === 0 && "Click on a date to set start date"}
                {selectionStep === 1 && "Click on a date to set end date"}
                {selectionStep === 2 && "Click Apply to confirm selection"}
              </Typography>
            </Box>
            {selectionStep > 0 && (
              <Typography
                variant="caption"
                sx={{
                  backgroundColor: theme.palette.primary.light,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  color: "#fff",
                  fontWeight: 500,
                }}
              >
                Step {selectionStep + 1} of 2
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${borderColor}`,
              backgroundColor: bgColor,
            }}
          >
            <Typography variant="body2" gutterBottom>
              Range:{" "}
              <strong>
                {format(tempState[0].startDate, "MMM dd, yyyy")} -{" "}
                {format(tempState[0].endDate, "MMM dd, yyyy")}
              </strong>
            </Typography>
          </Box>

          <DateRange
            editableDateInputs={false}
            onChange={handleChange}
            moveRangeOnFirstSelection={false}
            ranges={tempState}
            rangeColors={[theme.palette.primary.main]}
            showSelectionPreview={true}
            showDateDisplay={false}
            locale={enUS}
            className={mode === "dark" ? "dark-calendar" : ""}
          />

          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${borderColor}`,
              backgroundColor: mode === "dark" ? "#1c1c1c" : "#f5f5f5",
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              sx={{ minWidth: 80 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleApply}
              disabled={!isRangeValid()}
              sx={{ minWidth: 80 }}
            >
              Apply
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AdminDashboardDatePicker;
