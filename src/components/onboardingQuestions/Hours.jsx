import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import SelectBox from "./../common/SelectBox";
import { DAYS } from "../../utils/constants/onboarding";
import TimePickerBox from "../common/TimePickerBox";
import MuiTypography from "../common/MuiTypography";

function Hours({ index, handleDataChange, data, validation }) {
  const { t } = useTranslation();

  function onHourDataChange(id, value) {
    handleDataChange(id, value, index);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        mt: 2,
        width: "100%",
      }}
    >
      <Box sx={{ width: "100%", mb: 2 }}>
        <SelectBox
          id="daysOfWeek"
          placeholder="Day of week"
          value={data.daysOfWeek}
          options={DAYS}
          onSelectChange={onHourDataChange}
          multiple={true}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "40px",
            },
          }}
        />
        {!validation.valid && data.daysOfWeek.length === 0 && (
          <MuiTypography variant="errorText">
            {t("onboarding.required_days")}
          </MuiTypography>
        )}
      </Box>
      <Box sx={{ width: "48%" }}>
        <TimePickerBox
          id="startTime"
          placeholder="Start time"
          value={data?.startTime}
          onTimeChange={onHourDataChange}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "40px",
            },
          }}
        />
        {!validation.valid && !data?.startTime && (
          <MuiTypography variant="errorText">
            {t("onboarding.required_start_time")}
          </MuiTypography>
        )}
      </Box>
      <Box sx={{ width: "48%" }}>
        <TimePickerBox
          id="endTime"
          placeholder="End time"
          value={data?.endTime}
          onTimeChange={onHourDataChange}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "40px",
            },
          }}
        />
        {!validation.valid && !data?.endTime && (
          <MuiTypography variant="errorText">
            {t("onboarding.required_end_time")}
          </MuiTypography>
        )}
      </Box>
    </Box>
  );
}
export default Hours;
