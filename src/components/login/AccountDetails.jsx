import { useEffect, useState } from "react";
import { Box, Tooltip } from "@mui/material";
import { cloneDeep, isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import InfoIcon from "@mui/icons-material/Info";
import { useTranslation } from "react-i18next";

import { getMappedUserType, USER_INFO } from "../../utils/constants/login";
import MuiTypography from "../common/MuiTypography";
import FormFields from "../common/FormFields";
import { setAccountDetails, setUserType } from "../../redux/registerSlice";
import LoginLink from "./LoginLink";
import useCountry from "../../hooks/useCountry";
import useCity from "../../hooks/useCity";
import { fetchIPLocation } from "../../apis/apiEndPoints";

function AccountDetails({ initLoad, errorMsg }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { getCountries } = useCountry();
  const { getCities } = useCity();

  const { userType, accountDetails } = useSelector((state) => state.register);

  const [error, setError] = useState("");

  // async function fetchCountries() {
  //   const newFormData = cloneDeep(accountDetails);
  //   newFormData[3].options = await getCountries();
  //   dispatch(setAccountDetails(newFormData));
  // }

  useEffect(() => {
    setError(errorMsg);
  }, [errorMsg]);

  async function fetchlocalCountries() {
    const countries = await getCountries();

    try {
      const response = await fetchIPLocation();

      const userCountry = countries.find(
        (country) => country.isoCode === response.country_code
      );

      const newFormData = cloneDeep(accountDetails);
      const countryIndex = newFormData.findIndex((el) => el.id === "country");
      const cityIndex = newFormData.findIndex((el) => el.id === "city");

      if (countryIndex !== -1) {
        newFormData[countryIndex].options = countries;
      }

      if (userCountry) {
        const cities = await getCities(userCountry.isoCode);
        const userCity = cities.find(
          (city) => city.name.toLowerCase() === response.city.toLowerCase()
        );

        if (countryIndex !== -1) {
          newFormData[countryIndex].value = userCountry;
          newFormData[countryIndex].validation = {
            ...newFormData[countryIndex].validation,
            error: "",
            valid: true,
          };
        }

        if (cityIndex !== -1) {
          newFormData[cityIndex].options = cities;
          newFormData[cityIndex].value = userCity || "";
          newFormData[cityIndex].validation = {
            ...newFormData[cityIndex].validation,
            error: "",
            valid: !!userCity,
          };
        }
      } else {
        // User country not found in list — user has to select manually
        if (cityIndex !== -1) {
          newFormData[cityIndex].options = [];
        }
      }

      dispatch(setAccountDetails(newFormData));
    } catch (error) {
      console.error("Error fetching local country info:", error);

      // fallback — countries loaded, but nothing pre-selected
      const newFormData = cloneDeep(accountDetails);

      const countryIndex = newFormData.findIndex((el) => el.id === "country");
      const cityIndex = newFormData.findIndex((el) => el.id === "city");

      if (countryIndex !== -1) {
        newFormData[countryIndex].options = countries;
        newFormData[countryIndex].value = "";
        newFormData[countryIndex].validation = {
          ...newFormData[countryIndex].validation,
          error: "",
          valid: false,
        };
      }

      if (cityIndex !== -1) {
        newFormData[cityIndex].options = [];
        newFormData[cityIndex].value = "";
        newFormData[cityIndex].validation = {
          ...newFormData[cityIndex].validation,
          error: "",
          valid: false,
        };
      }

      dispatch(setAccountDetails(newFormData));
    }
  }

  useEffect(() => {
    // fetchCountries(); // load countries for dropdown
    fetchlocalCountries(); // detect and auto-set country + cities
  }, []);

  async function onValueChange(id, value, error) {
    if (error) {
      setError("");
    }

    const newFormData = cloneDeep(accountDetails);
    const fieldIndex = newFormData.findIndex((el) => el.id === id);
    if (id === "country") {
      const cityIndex = newFormData.findIndex((el) => el.id === "city");
      if (isEmpty(value)) {
        newFormData[cityIndex].options = [];
      } else {
        newFormData[cityIndex].value = "";

        newFormData[cityIndex].options = await getCities(value.isoCode);
      }
    }
    if (id === "userType") {
      dispatch(setUserType(value));
    }
    newFormData[fieldIndex].value = value;
    newFormData[fieldIndex].validation.error = error;
    newFormData[fieldIndex].validation.valid = error === "" ? true : false;
    dispatch(setAccountDetails(newFormData));
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
        {accountDetails.map(
          ({
            id,
            placeholder,
            type,
            value,
            validation,
            width,
            options,
            disabled,
          }) => (
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
                disabled={disabled}
              />
            </Box>
          )
        )}
        <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
          <MuiTypography
            variant="subtitle1"
            sx={{ marginRight: "4px", marginTop: "2px" }}
          >
            {t("login.create_account_as")}{" "}
            <strong>{getMappedUserType(userType)}</strong>
          </MuiTypography>
          {USER_INFO[userType] && (
            <Tooltip placement="bottom" title={USER_INFO[userType]}>
              <InfoIcon color="primary" fontSize="small" />
            </Tooltip>
          )}
        </Box>
      </Box>
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
      <LoginLink sx={{ mt: 1 }} />
    </>
  );
}

export default AccountDetails;
