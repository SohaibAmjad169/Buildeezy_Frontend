import { useEffect, useState } from "react";
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from "@mui/material";
import { isEmpty } from "lodash";
import { useSelector } from "react-redux";

import MuiTypography from "./MuiTypography";

function RadioBox({
  id: questionId,
  value,
  options,
  onSelectChange,
  validation = {},
  initLoad,
  disabled,
}) {
  const [error, setError] = useState("");
  const { loading } = useSelector((state) => state.config);

  useEffect(() => {
    setError(validation?.error);
  }, [validation.error]);

  function handleInputChange(e) {
    let validationError = "";
    const { value } = e.target;

    if (!isEmpty(validation) && !initLoad) {
      if (validation.rules) {
        validationError = validation.rules(
          value,
          "msg" in validation && validation.msg
        );
      }
      if (validationError === "" && validation.required) {
        validationError = value ? "" : "invalid";
      }
    }
    onSelectChange(questionId, value, validationError);
  }

  return (
    <>
      <FormControl
        sx={{
          width: "100%",
          ml: 1,
        }}
      >
        <RadioGroup
          row
          id={questionId}
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          value={value}
          onChange={handleInputChange}
        >
          {options?.length > 0 &&
            options.map(({ id, label }) => (
              <Box
                key={id}
                sx={{
                  flex: 1,
                }}
              >
                <FormControlLabel
                  disabled={loading || disabled}
                  value={id}
                  control={<Radio size="small" />}
                  label={label}
                />
              </Box>
            ))}
        </RadioGroup>
      </FormControl>
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
    </>
  );
}

export default RadioBox;
