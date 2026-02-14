import { Box, Chip, Stack } from "@mui/material";

import { colors } from "../../styles/theme";
import { useTranslation } from "react-i18next";
import { getLabelFromId } from "../../utils/common";
import MuiTypography from "./MuiTypography";
import { START_BY_OPTIONS } from "../../utils/constants/job";

function MuiChip({ value, id = "", showDot = false }) {
  const { t } = useTranslation();

  const label = getLabelFromId(value, id);
  let color = "",
    border = "",
    background = "";

  switch (label) {
    case "Preview Mode":
      color = colors.primary;
      border = colors.primary;
      background = `${colors.primary}10`;
      break;
    case START_BY_OPTIONS[0].label: // Urgent
    case START_BY_OPTIONS[7].label: // Accepted
    case START_BY_OPTIONS[11].label: // Registered
    case START_BY_OPTIONS[12].label: // Unverified
      color = colors.red100;
      border = colors.red200;
      background = colors.red300;
      break;
    case START_BY_OPTIONS[1].label: // Within a week
    case START_BY_OPTIONS[2].label: // Request a quote only
    case START_BY_OPTIONS[3].label: // Active
    case START_BY_OPTIONS[8].label: // Rejected
      color = colors.blue100;
      border = colors.blue200;
      background = colors.blue300;
      break;
    case START_BY_OPTIONS[4].label: // In Progress
    case START_BY_OPTIONS[9].label: // Verified
      color = colors.orange100;
      border = colors.orange200;
      background = colors.orange300;
      break;
    case START_BY_OPTIONS[5].label: // Completed
    case START_BY_OPTIONS[6].label: // Preview Mode
    case START_BY_OPTIONS[10].label: // Deactivated
      color = colors.green300;
      border = colors.green400;
      background = colors.green500;
      break;
    default:
      // Custom colors for specific general chips
      if (id === "areaSize") {
        color = colors.green300;
        border = colors.green400;
        background = colors.green500;
      } else if (id === "sitePreparation") {
        color = colors.orange100;
        border = colors.orange200;
        background = colors.orange300;
      } else if (id === "newConstruction") {
        color = "#bfa100"; // yellow text
        border = "#ffe066"; // light yellow border
        background = "#fff9db"; // pale yellow background
      } else {
        color = colors.black500;
        border = colors.grey400;
        background = colors.grey600;
      }
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
      {/* <MuiTypography sx={{ fontWeight: 500, fontSize: "0.8rem" }}>
        {id === "startTimePreference"
          ? t(`job.options.start_by.${value}`)
          : id === ""
            ? t(`job.options.status.${value}`)
            : getLabelFromId(value, id) || t("n/a")}
      </MuiTypography> */}
      <MuiTypography sx={{ fontWeight: 500, fontSize: "0.8rem" }}>
        {label || t("n/a")}
      </MuiTypography>
    </Stack>
  );
  return (
    <Chip
      label={labelText}
      sx={{
        fontWeight: 500,
        fontSize: "0.8rem",
        height: "28px",
        mr: 1,
        mb: 1,
        color: color,
        border: `solid 1px ${border}`,
        background: background,
        ...(label === "Preview Mode" && {
          "& .MuiChip-label": {
            color: colors.primary,
          },
        }),
      }}
    />
  );
}

export default MuiChip;
