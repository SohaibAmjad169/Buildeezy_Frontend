import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { cloneDeep } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import MuiTypography from "../common/MuiTypography";
import FormFields from "../common/FormFields";
import { setAuthDetails, setTerm } from "../../redux/registerSlice";
import CheckBox from "../common/CheckBox";
import LoginLink from "./LoginLink";

function AuthDetails({ initLoad, errorMsg, termError }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.config);
  const { authDetails, term } = useSelector((state) => state.register);

  const [error, setError] = useState("");

  useEffect(() => {
    setError(errorMsg);
  }, [errorMsg]);

  function handlePrivacyPolicy(checked) {
    dispatch(setTerm(checked));
  }

  function onValueChange(id, value, error) {
    if (error) {
      setError("");
    }

    const newFormData = cloneDeep(authDetails);
    const fieldIndex = newFormData.findIndex((el) => el.id === id);
    newFormData[fieldIndex].value = value;
    newFormData[fieldIndex].validation.error = error;
    newFormData[fieldIndex].validation.valid = error === "" ? true : false;
    dispatch(setAuthDetails(newFormData));
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          mt: 2,
        }}
      >
        {authDetails.map(
          ({ id, placeholder, type, value, validation, width, options }) => (
            <Box sx={{ mt: 2, width: width ? width : "100%" }} key={id}>
              <FormFields
                id={id}
                placeholder={placeholder}
                value={value}
                options={options}
                onValueChange={onValueChange}
                type={type}
                validation={validation}
                initLoad={initLoad}
              />
            </Box>
          )
        )}
        <CheckBox
          sx={{ mt: 2 }}
          disabled={loading}
          label={
            <Box
              sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
            >
              <MuiTypography variant="subtitle2">
                {t("login.agree_to")}&nbsp;
              </MuiTypography>

              <Link
                to="https://www.buildeezy.com/privacy"
                target="_blank"
                style={{ textDecoration: "none" }}
              >
                <MuiTypography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                >
                  {t("login.privacy_policy")}&nbsp;
                </MuiTypography>
              </Link>

              <Link
                to="https://www.buildeezy.com/terms"
                target="_blank"
                style={{ textDecoration: "none" }}
              >
                <MuiTypography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                >
                  {t("login.terms")}
                </MuiTypography>
              </Link>
            </Box>
          }
          checked={term}
          onChange={handlePrivacyPolicy}
          isRequired={true}
          errorMsg={termError}
        />
      </Box>
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
      <LoginLink sx={{ mt: 1 }} />
    </>
  );
}

export default AuthDetails;
