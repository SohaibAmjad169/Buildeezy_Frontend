import { Button, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";

function RoundButton({
  variant = "contained",
  onClick,
  sx,
  disabled,
  children,
  isLoading,
  color,
}) {
  const { loading } = useSelector((state) => state.config);

  return (
    <Button
      disabled={disabled || loading}
      sx={{
        borderRadius: "50px",
        fontSize: "0.7rem",
        padding: "9px 28px",
        minWidth: 120,
        fontWeight: 600,
        ...sx,
      }}
      variant={variant}
      onClick={onClick}
      startIcon={
        (loading || isLoading) && (
          <CircularProgress
            sx={{
              width: "20px !important",
              height: "20px !important",
              color: "disabledColor",
            }}
          />
        )
      }
      color={color}
    >
      {children}
    </Button>
  );
}

export default RoundButton;
