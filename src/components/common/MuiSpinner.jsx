import CircularProgress from "@mui/material/CircularProgress";

function MuiSpinner() {
  return (
    <CircularProgress
      color="inherit"
      sx={{
        width: "20px !important",
        height: "20px !important",
      }}
    />
  );
}

export default MuiSpinner;
