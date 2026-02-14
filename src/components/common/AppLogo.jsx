import { Box } from "@mui/material";

import logo from "../../assets/images/buildeezy_logo.svg";

function AppLogo({ styles }) {
  return (
    <Box
      component="img"
      sx={{
        width: { xs: "150px", md: "230px" },
        height: { xs: 28, md: 43 },
        mb: 4,
        alignSelf: "start",
        ...styles,
      }}
      src={logo}
      alt="app-logo"
    />
  );
}

export default AppLogo;
