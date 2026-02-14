import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getUserCategoriesByTypeUrl } from "../../apis/apiEndPoints";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import TalentFilterFields from "./TalentFilterFields";

const TalentFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState({
    professions: false,
    countries: false,
    cities: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingOptions((prev) => ({ ...prev, professions: true }));
        const response = await getUserCategoriesByTypeUrl("PROFESSIONAL");
        if (response?.data?.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error.message || "Failed to fetch professions",
          })
        );
        console.error("Error fetching professions:", error);
      } finally {
        setLoadingOptions((prev) => ({ ...prev, professions: false }));
      }
    };

    fetchCategories();
  }, [dispatch]);

  const countries = [
    { isoCode: "us", name: t("talent_filters.location.countries.us") },
    { isoCode: "uk", name: t("talent_filters.location.countries.uk") },
    { isoCode: "ca", name: t("talent_filters.location.countries.ca") },
  ];

  const cities = [
    { id: "new_york", name: t("talent_filters.location.cities.new_york") },
    {
      id: "san_francisco",
      name: t("talent_filters.location.cities.san_francisco"),
    },
    {
      id: "los_angeles",
      name: t("talent_filters.location.cities.los_angeles"),
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t("talent_filters.title")}
        </Typography>
      </Box>

      <TalentFilterFields
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        professions={categories}
        countries={countries}
        cities={cities}
        loadingOptions={loadingOptions}
      />
    </Box>
  );
};

TalentFilters.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.string,
    country: PropTypes.string,
    city: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};

export default TalentFilters;
