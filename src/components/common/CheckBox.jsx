import { useState, useEffect } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import MuiTypography from "./MuiTypography";
import { useTranslation } from "react-i18next";

function CheckBox({
  checked,
  onChange,
  label,
  sx,
  disabled,
  isRequired = false,
  errorMsg,
}) {
  const { t } = useTranslation();
  const [error, setError] = useState("");

  useEffect(() => {
    setError(errorMsg);
  }, [errorMsg]);

  function handleChange(e) {
    const isChecked = e.target.checked;
    if (isRequired && !isChecked) {
      setError(t("errors.invalid_term"));
    } else {
      setError("");
    }
    onChange(isChecked);
  }

  return (
    <>
      <FormControlLabel
        sx={{ ...sx }}
        disabled={disabled}
        control={
          <Checkbox checked={checked} size="small" onChange={handleChange} />
        }
        label={label}
      />
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
    </>
  );
}

export default CheckBox;
