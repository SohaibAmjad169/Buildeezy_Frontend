import { Box, InputBase, Divider } from "@mui/material";
import MuiTypography from "./MuiTypography";
import { colors } from "../../styles/theme";

function DoubleSideInput({
  label,
  firstValue,
  onFirstChange,
  firstPlaceholder,
  validation,
  disabled = false,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          border: "1px solid #D0D5DD",
          borderRadius: "8px",
          // backgroundColor: "#fff",
          overflow: "hidden",
          backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : undefined,
        })}
      >
        <Box
          sx={{
            minWidth: "max-content",
            maxWidth: "50%",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <MuiTypography variant="body2" sx={(theme) => ({ color: theme.palette.mode === "dark" ? "#fff" : "#000", })}>
            {label}
          </MuiTypography>
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ bgcolor: "#D0D5DD", width: "1px" }}
        />
        <InputBase
          fullWidth
          value={firstValue}
          onChange={(e) => onFirstChange(e.target.value)}
          placeholder={firstPlaceholder}
          disabled={disabled}
          sx={(theme) => ({
            pl: 2,
            "& .MuiInputBase-input": {
              fontSize: "0.875rem",
              // color: "#344054",
              color: theme.palette.mode === "dark" ? "#fff" : undefined,
              "&::placeholder": {
                fontSize: "0.875rem",
                opacity: 0.5,
                color: colors.grey300,
                // color: "#344054",
              },
            },
          })}
        />
      </Box>
      {validation?.error && (
        <MuiTypography variant="errorText">{validation.error}</MuiTypography>
      )}
    </Box>
  );
}

export { DoubleSideInput };
