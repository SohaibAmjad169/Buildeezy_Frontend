import { Typography } from "@mui/material";

function MuiTypography({ variant, sx, children, onClick = () => {}, disabled = false, ...rest }) {
  return (
    <Typography
      variant={variant}
      sx={{
        ...sx,
        color: disabled ? "disabledColor" : sx?.color,
        pointerEvents: disabled && "none",
      }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Typography>
  );
}

export default MuiTypography;
