import { Button } from "@mui/material";
import { useSelector } from "react-redux";

function SocialLoginButton({ label, styles, startIcon, onClick }) {
  const { loading } = useSelector((state) => state.config);

  return (
    <Button
      disabled={loading}
      variant="outlined"
      onClick={onClick}
      sx={{
        ...styles,
        borderRadius: "3.5rem",
        width: "100%",
        height: "45px",
        color: "common.black",
        backgroundColor: "socialButton.main",
        borderColor: "borderColor100",
        justifyContent: "start",
        pl: "29%",
        "& .MuiButton-icon": {
          mr: "8%",
        },
      }}
      startIcon={startIcon}
    >
      {label}
    </Button>
  );
}

export default SocialLoginButton;
