import { useSelector } from "react-redux";
import { TextField, Autocomplete } from "@mui/material";
import { useTranslation } from "react-i18next";

import MuiTypography from "./MuiTypography";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";

function AutocompleteBox({
  id,
  placeholder,
  options,
  onSelectChange,
  onInputChange,
  value: selectedValue,
  validation = {},
  initLoad,
  disabled = false,
}) {
  const { t } = useTranslation();

  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState("");
  const { loading, loadData } = useSelector((state) => state.config);

  useEffect(() => {
    // if (!error) {
    setError(validation?.error);
    // }
  }, [validation?.error]);

  const handleChange = (e, value) => {
    let validationError = "";

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
    onSelectChange(id, value, validationError);
  };
  function handleInputChange(e) {
    const value = e.target.value;
    setInputValue(value);
    if (onInputChange) {
      onInputChange(id, value);
    }
  }

  return (
    <>
      <Autocomplete
        disabled={loading || disabled}
        id={id}
        name={id}
        size="small"
        options={options}
        autoHighlight
        getOptionLabel={(option) => option.name || option.label || ""}
        value={selectedValue}
        onChange={handleChange}
        loading={loadData}
        noOptionsText={
          <MuiTypography variant="subtitle2">{t("no_options")}</MuiTypography>
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            disabled={loading}
            value={inputValue}
            onChange={handleInputChange}
          />
        )}
      />
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
    </>
  );
}

export default AutocompleteBox;
