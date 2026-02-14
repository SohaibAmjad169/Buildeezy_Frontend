import { Box, Breadcrumbs } from "@mui/material";
import Link from "@mui/material/Link";
import { useNavigate } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import MuiTypography from "./MuiTypography";
import { alpha } from "@mui/material";

function MuiBreadcrumbs({ pastLinks, activeLink }) {
  const navigate = useNavigate();

  function onNavigate(path) {
    navigate(path);
  }
  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextIcon fontSize="small" />}
      color={"uploadBorder"}
    >
      {pastLinks.map((link) => (
        <Link
          key={link.path}
          underline="hover"
          color="inherit"
          onClick={() => onNavigate(link.path)}
          sx={{ cursor: "pointer" }}
        >
          <MuiTypography variant="subtitle1">{link.label}</MuiTypography>
        </Link>
      ))}

      <Box
        sx={(theme) => ({
          // backgroundColor: "greyBackground",
          backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.grey[100], 0.1)
        : "greyBackground",
          px: 1,
          borderRadius: "6px",
        })}
      >
        <MuiTypography sx={{ color: "common.black" }}>
          <MuiTypography variant="subtitle1" component={"span"}>
            {activeLink.label}
          </MuiTypography>
        </MuiTypography>
      </Box>
    </Breadcrumbs>
  );
}
export default MuiBreadcrumbs;
