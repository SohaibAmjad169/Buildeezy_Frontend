import { Box, Stack } from "@mui/material";
import MuiTypography from "./MuiTypography";
import MuiChip from "./MuiChip";
import { START_BY_OPTIONS } from "../../utils/constants/job";
import { getLabelFromId } from "../../utils/common";
import { colors } from "../../styles/theme";
import { useTranslation } from "react-i18next";

function StartByColorChip({ value, id, showDot = true }) {
  const { t } = useTranslation();

  const label = getLabelFromId(value, id);
  let color = "",
    border = "",
    background = "";

  switch (label) {
    case START_BY_OPTIONS[0].label: // Urgent
      color = colors.red100;
      border = colors.red200;
      background = colors.red300;
      break;
    case START_BY_OPTIONS[1].label: // Within a week
    case START_BY_OPTIONS[2].label: // Request a quote only
      color = colors.blue100;
      border = colors.blue200;
      background = colors.blue300;
      break;
    default:
      color = colors.orange100;
      border = colors.orange200;
      background = colors.orange300;
      break;
  }
  const labelText = (
    <Stack direction={"row"} alignItems={"center"} spacing={1}>
      {showDot && (
        <Box
          sx={{
            width: "6px",
            height: "6px",
            borderRadius: "10px",
            backgroundColor: color,
          }}
        ></Box>
      )}
      <MuiTypography sx={{ fontWeight: 500, fontSize: "0.8rem" }}>
        {label || t("n/a")}
      </MuiTypography>
    </Stack>
  );
  return (
    <MuiChip
      label={labelText}
      sx={{
        color: color,
        border: `solid 1px ${border}`,
        background: background,
      }}
    />
  );
}
export default StartByColorChip;
