import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { cloneDeep, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";

import AutocompleteBox from "../common/AutocompleteBox";
import useCity from "../../hooks/useCity";
import useCountry from "../../hooks/useCountry";
import { useSelector } from "react-redux";
import MuiTypography from "./MuiTypography";

const WHERE_JOB = {
  country: null,
  city: null,
};
function CountryCityBox({
  id: whereJobId,
  value,
  onInputChange,
  validation = {},
  initLoad,
  disabled,
}) {
  const { countries, cities } = useSelector((state) => state.config);

  const { getCities, getCachedCities } = useCity();
  const { getCountries, getCachedCountries } = useCountry();

  const [whereJob, setWhereJob] = useState(WHERE_JOB);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  // Lazy load countries when component is first used
  useEffect(() => {
    const loadCountriesIfNeeded = async () => {
      if (countries.length === 0) {
        const cachedCountries = getCachedCountries();
        if (cachedCountries.length === 0) {
          await getCountries();
        }
      }
    };
    
    loadCountriesIfNeeded();
  }, []); // Only run once when component mounts

  useEffect(() => {
    // if (!error) {
    setError(validation?.error);
    // }
  }, [validation?.error]);

  useEffect(() => {
    if (!isEmpty(value)) {
      setWhereJob({
        country: value.country && value.country.name ? value.country : null,
        city: value.city && value.city.name ? value.city : null,
      });
    } else {
      setWhereJob(WHERE_JOB);
    }
  }, [value]);

  async function onAddressValueChange(id, value) {
    const newWhereJob = cloneDeep(whereJob);
    if (id === "country") {
      newWhereJob.city = null;
      if (value && value.isoCode) {
        // Use cached cities if available, otherwise fetch
        const cachedCities = getCachedCities(value.isoCode);
        if (cachedCities.length === 0) {
          await getCities(value.isoCode);
        }
      }
    }

    newWhereJob[id] = value && value.name ? value : null;

    let validationError = "";
    if (!isEmpty(validation) && !initLoad) {
      if (validation.rules) {
        validationError = validation.rules(
          newWhereJob,
          "msg" in validation && validation.msg
        );
      }

      if (validationError === "" && validation.required) {
        validationError = newWhereJob ? "" : "invalid";
      }
    }

    setWhereJob(newWhereJob);
    onInputChange(whereJobId, newWhereJob, validationError);
  }

  return (
    <>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <AutocompleteBox
            id="country"
            placeholder={t("country_placeholder")}
            value={whereJob.country}
            options={countries}
            onSelectChange={onAddressValueChange}
            disabled={disabled}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <AutocompleteBox
            id="city"
            placeholder={t("city_placeholder")}
            value={whereJob.city}
            options={cities}
            onSelectChange={onAddressValueChange}
            disabled={disabled}
          />
        </Box>
      </Box>
      {error && <MuiTypography variant="errorText">{error}</MuiTypography>}
    </>
  );
}

export default CountryCityBox;
