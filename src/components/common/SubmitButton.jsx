import { Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

function SubmitButton({
  variant = "contained",
  onClick,
  sx,
  disabled,
  children,
  loading,
}) {
  return (
    <Button
      disabled={disabled}
      sx={{
        width: "inherit",
        ...sx,
      }}
      variant={variant}
      fullWidth
      onClick={onClick}
      startIcon={
        loading && (
          <CircularProgress
            sx={{
              width: "20px !important",
              height: "20px !important",
              color: "disabledColor",
            }}
          />
        )
      }
    >
      {children}
    </Button>
  );
}

export default SubmitButton;
