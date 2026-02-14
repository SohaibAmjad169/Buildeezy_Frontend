import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import MuiTypography from "../common/MuiTypography";

function RadioButtonType({
  id,
  label,
  options,
  value,
  onValueChange,
  validation,
}) {
  return (
    <>
      <MuiTypography variant="h4" sx={{ mb: 2, fontWeight: 500 }}>
        {label}
      </MuiTypography>
      <RadioGroup
        aria-labelledby="demo-controlled-radio-buttons-group"
        name="controlled-radio-buttons-group"
        value={value}
        onChange={onValueChange}
        sx={{
          ml: 1,
        }}
      >
        {options.map(({ id, label }) => (
          <FormControlLabel
            key={id}
            value={id}
            control={<Radio size="small" />}
            label={label}
          />
        ))}
      </RadioGroup>
      {!validation?.valid && (
        <MuiTypography variant="errorText">{validation?.error}</MuiTypography>
      )}
    </>
  );
}
export default RadioButtonType;
