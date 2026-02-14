import { Box } from "@mui/material";
import MuiTypography from "../../components/common/MuiTypography";
import { colors } from "../../styles/theme";

export const NotificationBox = ({ 
  type = "info", 
  icon, 
  title, 
  description,
  compact = true 
}) => {
  // Define color schemes based on type
  const colorSchemes = {
    info: {
      bgColor: colors.green500,
      borderColor: colors.primary,
      iconBgColor: colors.primary,
      titleColor: colors.primary,
    },
    warning: {
      bgColor: colors.orange300,
      borderColor: colors.orange100,
      iconBgColor: colors.orange100,
      titleColor: colors.orange100,
    },
    secondary: {
      bgColor: colors.blue300,
      borderColor: colors.blue100,
      iconBgColor: colors.blue100,
      titleColor: colors.blue100,
    },
  };

  const scheme = colorSchemes[type] || colorSchemes.info;

  return (
    <Box
      sx={{
        mt: 2,
        p: compact ? 1.5 : 2,
        bgcolor: scheme.bgColor,
        border: `1px solid ${scheme.borderColor}`,
        borderRadius: 2,
        display: "flex",
        alignItems: compact ? "center" : "flex-start",
        gap: 1.5,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: compact ? 28 : 32,
            height: compact ? 28 : 32,
            borderRadius: "50%",
            bgcolor: scheme.iconBgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.white,
            fontSize: compact ? "12px" : "14px",
            fontWeight: "600",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1 }}>
        <MuiTypography
          variant="h6"
          sx={{ 
            color: scheme.titleColor,
            mb: 0.25,
            fontSize: compact ? "0.8rem" : "0.85rem",
            fontWeight: 600,
          }}
        >
          {title}
        </MuiTypography>
        <MuiTypography
          variant="body2"
          sx={{ 
            color: colors.grey700,
            lineHeight: 1.4,
            fontSize: compact ? "0.75rem" : "0.8rem",
          }}
        >
          {description}
        </MuiTypography>
      </Box>
    </Box>
  );
};


