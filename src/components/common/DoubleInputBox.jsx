import { useEffect, useState } from "react";
import { Box, OutlinedInput } from "@mui/material";
import { isEmpty } from "lodash";
import { useSelector } from "react-redux";

import MuiTypography from "./MuiTypography";
import { FIELD_TYPES } from "../../utils/constants/login";

function DoubleInputBox({
  id,
  placeholder = ["", ""],
  value = { first: "", second: "" },
  onInputChange,
  validation = {},
  initLoad,
  disabled,
}) {
  const [error, setError] = useState("");
  const { loading } = useSelector((state) => state.config);

  useEffect(() => {
    setError(validation?.error);
  }, [validation?.error]);

  function handleInputChange(subField, e) {
    let validationError = "";
    const newValue = { ...value };

    // Update the specific subfield
    newValue[subField] = e.target.value;

    if (!isEmpty(validation) && !initLoad) {
      if (validation.rules) {
        validationError = validation.rules(
          newValue,
          "msg" in validation && validation.msg
        );
      }
      if (validationError === "" && validation.required) {
        validationError = newValue.first || newValue.second ? "" : "invalid";
      }
    }

    onInputChange(id, newValue, validationError);
  }

  return (
    <>
      <Box sx={{ display: "flex", width: "100%", gap: 1 }}>
        <OutlinedInput
          fullWidth
          disabled={loading || disabled}
          id={`${id}-first`}
          type={FIELD_TYPES.text}
          placeholder={
            Array.isArray(placeholder) ? placeholder[0] : placeholder
          }
          inputProps={{
            style: {
              height: "12px",
              borderRadius: 8,
            },
          }}
          sx={{
            height: 46,
            flex: 1,
          }}
          value={value.first || ""}
          onChange={(e) => handleInputChange("first", e)}
        />
        <OutlinedInput
          fullWidth
          disabled={loading || disabled}
          id={`${id}-second`}
          type={FIELD_TYPES.text}
          placeholder={Array.isArray(placeholder) ? placeholder[1] : ""}
          inputProps={{
            style: {
              height: "12px",
              borderRadius: 8,
            },
          }}
          sx={{
            height: 46,
            flex: 1,
          }}
          value={value.second || ""}
          onChange={(e) => handleInputChange("second", e)}
        />
      </Box>
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
    </>
  );
}

export default DoubleInputBox;
