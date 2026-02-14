import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import "react-international-phone/style.css";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";
import { isEmpty } from "lodash";
import MuiTypography from "./MuiTypography";
import { useTranslation } from "react-i18next";

import { useThemeMode } from "./../../context/ThemeContext";
import { colors } from "../../styles/theme";

function ContactBox({
  id,
  placeholder,
  onInputChange,
  value,
  validation,
  initLoad,
  disabled,
}) {
  const { mode } = useThemeMode();

  const { loading } = useSelector((state) => state.config);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    // if (!error) {
    setError(validation?.error);
    // }
  }, [validation?.error]);

  const handleInputChange = (value) => {
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
    onInputChange(id, value, validationError);
  };

  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: "sg",
      value: value || "",
      countries: defaultCountries,
      onChange: (data) => {
        handleInputChange(data.phone);
      },
    });

  return (
    <>
      <TextField
        fullWidth
        disabled={loading || disabled}
        hiddenLabel
        variant="outlined"
        size="small"
        id={`contact_id_${id}`}
        name={id}
        value={inputValue}
        placeholder={placeholder}
        onChange={handlePhoneValueChange}
        type="tel"
        inputRef={inputRef}
        InputProps={{
          startAdornment: (
            <InputAdornment
              position="start"
              style={{ marginRight: "0.125rem", marginLeft: "-0.5rem" }}
            >
              <Select
                disabled={loading || disabled}
                MenuProps={{
                  style: {
                    height: "300px",
                    width: "360px",
                    top: "0.625rem",
                    left: "-2.125rem",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                }}
                sx={{
                  width: "max-content",
                  // Remove default outline (display only on focus)
                  fieldset: {
                    display: "none",
                  },
                  '&.Mui-focused:has(div[aria-expanded="false"])': {
                    fieldset: {
                      display: "block",
                    },
                  },
                  // Update default spacing
                  ".MuiSelect-select": {
                    padding: "8px",
                    paddingRight: "24px !important",
                  },

                  svg: {
                    right: 0,
                  },
                }}
                value={country.iso2}
                onChange={(e) => setCountry(e.target.value)}
                renderValue={(value) => (
                  <FlagImage iso2={value} style={{ display: "flex" }} />
                )}
              >
                {defaultCountries.map((c) => {
                  const country = parseCountry(c);
                  return (
                    <MenuItem key={country.iso2} value={country.iso2}>
                      <FlagImage
                        iso2={country.iso2}
                        style={{ marginRight: "0.5rem" }}
                      />
                      <Typography marginRight="0.5rem">
                        {country.name}
                      </Typography>
                      <Typography color="gray">+{country.dialCode}</Typography>
                    </MenuItem>
                  );
                })}
              </Select>
            </InputAdornment>
          ),
        }}
        sx={{
          borderRadius: "8px",
          "& .Mui-disabled": {
            backgroundColor: mode === "dark" ? colors.black400 : colors.grey100,
          },
        }}
      />
      {error && <MuiTypography variant="errorText">{t(error)}</MuiTypography>}
    </>
  );
}

export default ContactBox;
