import { Box, CircularProgress } from "@mui/material";

const SpinnerLoader = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black shadow
        zIndex: 9999, // upar rahe
      }}
    >
      <CircularProgress style={{ color: "#fff" }} />
    </Box>
  );
};

export default SpinnerLoader;
