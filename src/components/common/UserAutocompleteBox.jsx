import { useSelector } from "react-redux";
import { TextField, Autocomplete, Avatar, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import MuiTypography from "./MuiTypography";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";

// Utility to format category string
function formatCategory(category) {
  if (!category) return "";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function UserAutocompleteBox({
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
    setError(validation?.error);
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
        options={options || []}
        autoHighlight
        getOptionLabel={(option) => {
          if (!option) return "";
          return option.name || option.label || "";
        }}
        getOptionKey={(option) => option.id}
        value={selectedValue || null}
        onChange={handleChange}
        loading={loadData}
        isOptionEqualToValue={(option, value) => {
          if (!option || !value) return false;
          if (typeof option === "string" || typeof value === "string")
            return false;
          return option.name === value.name || option.id === value.id;
        }}
        noOptionsText={
          <MuiTypography variant="subtitle2">{t("no_options")}</MuiTypography>
        }
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box
              component="li"
              key={key}
              {...otherProps}
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                py: 1,
                px: 2,
                width: "100%",
              }}
            >
              <Avatar
                src={option.avatar}
                alt={option.label}
                sx={{ width: 48, height: 48, mr: 2 }}
              />
              <Box>
                <MuiTypography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#181C32", lineHeight: 1 }}
                >
                  {option.label}
                </MuiTypography>
                <MuiTypography
                  variant="h5"
                  sx={{ color: "#6B7280", fontWeight: 400 }}
                >
                  {formatCategory(option.category)}
                </MuiTypography>
              </Box>
            </Box>
          );
        }}
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

export default UserAutocompleteBox;
