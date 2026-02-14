import React from "react";
import { Button } from "@mui/material";
import StartIcon from "./StartIcon";

function ActionButton({
  variant = "contained",
  onClick,
  sx,
  disabled,
  children,
  startIcon,
  color,
}) {
  return (
    <Button
      disabled={disabled}
      sx={{
        width: "inherit",
        borderRadius: "8px",
        fontSize: "0.7rem",
        fontWeight: 600,
        "&.Mui-disabled": {
          border: "1px solid #E4E7EC",
          background: "#F9FAFB",
          color: "#98A2B3",
          fontWeight: 500,
        },
        ...sx,
      }}
      variant={variant}
      fullWidth
      onClick={onClick}
      startIcon={startIcon && (
        typeof startIcon === 'string' 
          ? <StartIcon imageSrc={startIcon} />
          : typeof startIcon === 'function'
          ? React.createElement(startIcon)
          : React.isValidElement(startIcon)
          ? startIcon
          : typeof startIcon === 'object' && startIcon.$$typeof
          ? React.createElement(startIcon)
          : startIcon
      )}
      color={color}
    >
      {children}
    </Button>
  );
}

export default ActionButton;
