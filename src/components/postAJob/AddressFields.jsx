import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { cloneDeep, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";

import InputBox from "../common/InputBox";
import AutocompleteBox from "../common/AutocompleteBox";
import useCity from "../../hooks/useCity";
import { useSelector } from "react-redux";

const WHERE_JOB = {
  address: "",
  country: { name: "" },
  city: { name: "" },
};
function AddressFields({ id: whereJobId, placeholder, value, onInputChange }) {
  const { countries, cities } = useSelector((state) => state.config);
  const { getCities } = useCity();
  const [whereJob, setWhereJob] = useState(WHERE_JOB);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isEmpty(value)) {
      setWhereJob(value);
    }
  }, [value]);

  async function onAddressValueChange(id, value) {
    const newWhereJob = cloneDeep(whereJob);
    if (id === "country") {
      newWhereJob.city = { name: "" };
      await getCities(value?.isoCode);
    }
    newWhereJob[id] = value;
    setWhereJob(newWhereJob);
    onInputChange(whereJobId, newWhereJob);
  }

  return (
    <>
      <InputBox
        id="address"
        placeholder={placeholder}
        value={whereJob.address}
        onInputChange={onAddressValueChange}
      />
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
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <AutocompleteBox
            id="city"
            placeholder={t("city_placeholder")}
            value={whereJob.city}
            options={cities}
            onSelectChange={onAddressValueChange}
          />
        </Box>
      </Box>
    </>
  );
}

export default AddressFields;
