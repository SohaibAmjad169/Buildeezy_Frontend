import { Box } from "@mui/material";
import MuiSpinner from "./MuiSpinner";

function FallbackSpinner() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MuiSpinner />
    </Box>
  );
}

export default FallbackSpinner;
