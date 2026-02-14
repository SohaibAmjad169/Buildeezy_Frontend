import { Box, useTheme } from "@mui/material";
import MuiTypography from "../common/MuiTypography";
import { colors } from "../../styles/theme";

export default function AdminDashboardCard({ title, value, mode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        borderRadius: "14px",
        border: "1px solid #131A471F",
        backdropFilter: "blur(50px)",
        backgroundColor:
          mode === "dark"
            ? theme.palette.grey[900]
            : theme.palette.common.white,
        p: 2,
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
        "&:hover": {
          boxShadow: `0px 4px 20px ${colors.primary}`,
          transform: "translateY(-2px)",
        },
      }}
    >
      <MuiTypography
        variant="h3"
        sx={{
          color: mode === "dark" ? "#fff" : "#131A47",
          textTransform: "capitalize",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {title}
      </MuiTypography>
      <MuiTypography
        variant="h4"
        sx={{
          fontWeight: 600,
          color: "primary.main",
          fontSize: 14,
          mt: 1,
        }}
      >
        {value}
      </MuiTypography>
    </Box>
  );
}
