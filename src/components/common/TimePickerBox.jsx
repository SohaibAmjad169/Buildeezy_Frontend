import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useSelector } from "react-redux";
import { TextField } from "@mui/material";

const CustomTextField = (props) => {
  return <TextField {...props} placeholder={props.placeholder} />;
};

function TimePickerBox({ id, placeholder, onTimeChange, value, sx }) {
  const { loading } = useSelector((state) => state.config);

  const dateValue = dayjs(new Date()).format("YYYY-MM-DD");

  function getTime(timeValue) {
    return dayjs(dateValue + "T" + timeValue);
  }

  const handleChange = (value) => {
    onTimeChange(id, dayjs(value).format("HH:mm"));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        disabled={loading}
        id={id}
        value={value ? getTime(value) : null}
        onChange={(newValue) => handleChange(newValue)}
        slots={{
          textField: CustomTextField,
        }}
        slotProps={{ textField: { placeholder } }}
        sx={{
          width: "100%",
          "& .MuiInputBase-root": {
            fontSize: "0.813rem",
            height: "40px",
          },
          ...sx,
        }}
      />
    </LocalizationProvider>
  );
}

export default TimePickerBox;
