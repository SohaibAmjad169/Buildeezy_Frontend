import { IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function NavigationBtn({ onClick, disabled = false, type = "prev", sx }) {
  return (
    <IconButton
      disabled={disabled}
      onClick={onClick}
      sx={{
        ...sx,
        backgroundColor: type === "next" ? "primary.main" : "transparent",
        color: type === "next" ? "common.white" : "common.black",
        border: type === "prev" && "solid 1px",
        borderColor: type === "prev" && "borderColor100",
        width: { xs: 35, md: 45 },
        height: { xs: 35, md: 45 },
        "& svg": {
          width: { xs: 18, md: 24 },
          height: { xs: 18, md: 24 },
        },
        "&:hover": {
          backgroundColor: type === "next" ? "primary.dark" : "transparent",
          boxShadow:
            "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
        },
        "&:disabled": {
          backgroundColor: "borderColor100",
        },
      }}
    >
      {type === "next" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
    </IconButton>
  );
}

export default NavigationBtn;
