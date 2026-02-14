import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import utc from "dayjs/plugin/utc";
function MuiDatePickerBox({
  id,
  onDateChange,
  value,
  minDate = null,
  maxDate = null,
  disabled = false,
  placeholder = "DD/MM/YYYY",
  sx,
  type = "future", // "future" | "past" | "any"
}) {
  const { loading } = useSelector((state) => state.config);
  dayjs.extend(utc);

  const handleChange = (value) => {
    // onDateChange(id, dayjs(value).format("YYYY-MM-DD"));
    onDateChange(id, dayjs(value).toISOString());
    const utcDate = dayjs.utc(dayjs(value).format("YYYY-MM-DD")).toISOString();
    // onDateChange(id, utcDate);
  };

  // Determine date restrictions based on type
  const getDateRestrictions = () => {
    switch (type) {
      case "past":
        return {
          disablePast: false,
          maxDate: dayjs(),
          minDate: minDate || null,
        };
      case "future":
        return {
          disablePast: true,
          minDate: minDate || dayjs(),
          maxDate: maxDate || null,
        };
      case "any":
        return {
          disablePast: false,
          minDate: minDate || null,
          maxDate: maxDate || null,
        };
      default:
        return {
          disablePast: true,
          minDate: minDate || dayjs(),
          maxDate: maxDate || null,
        };
    }
  };

  const dateRestrictions = getDateRestrictions();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        {...dateRestrictions}
        disabled={loading || disabled}
        className="date-field"
        format="DD/MM/YYYY"
        id={id}
        name={id}
        value={value ? dayjs(value) : null}
        onChange={handleChange}
        slotProps={{ textField: { placeholder: placeholder } }}
        sx={{
          "& .MuiInputBase-root": {
            fontSize: "0.813rem",
            height: 40,
          },
          ...sx,
        }}
      ></DatePicker>
    </LocalizationProvider>
  );
}

export default MuiDatePickerBox;
