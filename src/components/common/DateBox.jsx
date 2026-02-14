import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import MuiTypography from "./MuiTypography";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import MuiDatePickerBox from "./MuiDatePickerBox";
import dayjs from "dayjs";

function DateBox({
  id,
  onSelectChange,
  value: dateArray,
  validation = {},
  initLoad,
  disabled = false,
  type = "future", // "future" | "past" | "any"
}) {
  const { t } = useTranslation();

  const [error, setError] = useState("");

  useEffect(() => {
    setError(validation?.error);
  }, [validation?.error]);

  const onDateValueChange = (e, value, index) => {
    let validationError = "";
    dateArray[index].value = value;

    if (!isEmpty(validation) && !initLoad) {
      if (validation.rules) {
        validationError = validation.rules(
          dateArray,
          "msg" in validation && validation.msg
        );
      }
      if (validationError === "" && validation.required) {
        validationError = dateArray ? "" : "invalid";
      }
    }

    onSelectChange(id, dateArray, validationError, index);
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "inherit" },
          }}
        >
          <MuiTypography variant="subtitle2">
            {t("ad.start_date")}
          </MuiTypography>
          <MuiDatePickerBox
            id={dateArray[0]?.id}
            onDateChange={(id, value) => onDateValueChange(id, value, 0)}
            value={dateArray[0].value}
            disabled={disabled}
            type={type}
          />
        </Box>

        <Box sx={{ width: { xs: "100%", sm: "inherit" } }}>
          <MuiTypography variant="subtitle2">{t("ad.end_date")}</MuiTypography>
          <MuiDatePickerBox
            id={dateArray[1].id}
            onDateChange={(id, value) => onDateValueChange(id, value, 1)}
            value={dateArray[1].value}
            disabled={!dateArray[0].value || disabled}
            minDate={dayjs(dateArray[0].value).add(1, "day")}
            type={type}
          />
        </Box>
      </Stack>
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
    </>
  );
}

export default DateBox;
