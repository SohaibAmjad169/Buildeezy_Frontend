import { Button } from "@mui/material";

function PreviewModeButton({
  onClick,
  sx = {},
  disabled = false,
  children,
  themeColors,
  ...props
}) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      sx={{
        borderRadius: "8px",
        backgroundColor: themeColors?.main,
        color: themeColors?.bg,
        fontWeight: 600,
        fontSize: "1rem",
        minWidth: 120,
        maxWidth: 220,
        padding: "10px 32px",
        boxShadow: "none",
        "&:hover": {
          backgroundColor: themeColors?.main,
          opacity: 0.85,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export default PreviewModeButton;
