import { Box } from "@mui/material";
import CompanyDetailType from "./CompanyDetailType";

function CompanyDetailsContainer({ value = {}, onChange, disabled = false }) {
  function handleValueChange(newValue) {
    onChange("companyDetails", newValue);
  }
  return (
    <Box sx={{ width: "100%" }}>
      <CompanyDetailType
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      />
    </Box>
  );
}

export default CompanyDetailsContainer;
