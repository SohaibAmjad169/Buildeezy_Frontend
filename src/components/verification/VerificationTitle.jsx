import { Box } from "@mui/material";
import { colors } from "../../styles/theme";
import MuiTypography from "../common/MuiTypography";
import { useThemeMode } from "./../../context/ThemeContext";

function VerificationTitle({ title }) {
  const { mode } = useThemeMode();
  return (
    <Box
      sx={{
        width: "100%",
        px: 2,
        py: 1,
        borderRadius: "8px",
        backgroundColor: mode === "dark" ? colors.black300 : colors.grey200,
        mt: 2,
      }}
    >
      <MuiTypography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </MuiTypography>
    </Box>
  );
}

export default VerificationTitle;
