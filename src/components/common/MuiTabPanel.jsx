import { Box } from "@mui/material";

function MuiTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ display: value !== index ? "none" : "block" }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default MuiTabPanel;
