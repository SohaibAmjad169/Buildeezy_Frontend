import { useEffect, useState } from "react";
import {
  OutlinedInput,
  InputAdornment,
  IconButton,
  Tooltip,
  Box,
  Divider,
} from "@mui/material";
import { isEmpty } from "lodash";
import { useSelector } from "react-redux";
import { Eye, EyeSlash } from "iconsax-react";
import { useTranslation } from "react-i18next";


import MuiTypography from "./MuiTypography";
import { FIELD_TYPES } from "../../utils/constants/login";

function InputBox({
  id,
  placeholder,
  value,
  onInputChange,
  type = FIELD_TYPES.text,
  validation = {},
  initLoad,
  disabled,
  label,
  labelVariant = "body1",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { loading } = useSelector((state) => state.config);
  const { t } = useTranslation();

  useEffect(() => {
    setError(validation?.error);
  }, [validation.error]);

  function handleInputChange(e) {
    let validationError = "";
    const { id, value } = e.target;

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
  }

  return (
    <>
      <Box sx={{ position: "relative", width: "100%" }}>
        <OutlinedInput
          multiline={type === FIELD_TYPES.description}
          rows={type === FIELD_TYPES.description ? 3 : 1}
          fullWidth
          disabled={loading || disabled}
          id={id}
          type={
            type === FIELD_TYPES.password
              ? showPassword
                ? FIELD_TYPES.text
                : FIELD_TYPES.password
              : type
          }
          placeholder={placeholder}
          inputProps={{
            style: {
              height: "12px",
              borderRadius: 8,
              paddingLeft: type === FIELD_TYPES.description ? "0px" : "14px",
              paddingRight: type === FIELD_TYPES.password ? "40px" : "14px",
            },
            maxLength: type === FIELD_TYPES.description ? 300 : undefined,
          }}
          sx={{
            height: type !== FIELD_TYPES.description ? 46 : 93,
            "& .MuiInputAdornment-root": {
              height: "100%",
              margin: 0,
              position: "absolute",
              "&.MuiInputAdornment-positionStart": {
                left: 0,
                ml: 1,
              },
              "&.MuiInputAdornment-positionEnd": {
                right: 0,
                mr: 1,
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "text.secondary",
            },
          }}
          startAdornment={
            label && (
              <InputAdornment position="start">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <MuiTypography
                    variant={labelVariant}
                    sx={{
                      fontWeight: 500,
                      color: "text.secondary",
                      mr: 1,
                    }}
                  >
                    {label}
                  </MuiTypography>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      height: "100%",
                      borderColor: "text.secondary",
                      opacity: 0.5,
                      margin: 0,
                      position: "absolute",
                      right: -8,
                      top: 0,
                    }}
                  />
                </Box>
              </InputAdornment>
            )
          }
          endAdornment={
            type === FIELD_TYPES.password && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="password"
                  edge="end"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  sx={{ mr: 0 }}
                >
                  {showPassword ? (
                    <Tooltip title="hide" placement="top">
                      <EyeSlash size="20" />
                    </Tooltip>
                  ) : (
                    <Tooltip title="show" placement="top">
                      <Eye size="20" />
                    </Tooltip>
                  )}
                </IconButton>
              </InputAdornment>
            )
          }
          value={value}
          onChange={handleInputChange}
          error={!!error}
        />
        {type === FIELD_TYPES.description && (
          <MuiTypography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "left",
              mt: 0.5,
              color: "#667085",
            }}
          >
            {validation?.maxLength
              ? validation.maxLength - (value?.length || 0)
              : 300 - (value?.length || 0)}{" "}
            {t("profile.characters_left")}
          </MuiTypography>
        )}
      </Box>
      {error && <MuiTypography variant="errorText">{t(error)}</MuiTypography>}
    </>
  );
}

export default InputBox;
