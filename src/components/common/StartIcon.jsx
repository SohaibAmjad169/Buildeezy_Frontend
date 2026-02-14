import { Box } from "@mui/material";

function StartIcon({ imageSrc }) {
  return (
    <Box
      component="img"
      src={imageSrc}
      alt="icon"
      sx={{ width: "20px", height: "20px" }}
    />
  );
}

export default StartIcon;
