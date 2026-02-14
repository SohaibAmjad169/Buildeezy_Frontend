import {
  Box,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

function TalentFilterFields({
  filters,
  onFilterChange,
  onClearFilters,
  professions = [],
  countries = [],
  cities = [],
  loadingOptions,
}) {
  const { t } = useTranslation();

  const selectStyles = {
    height: "48px",
    "& .MuiSelect-select": {
      color: "#1F2937",
      fontSize: "14px",
      fontWeight: 500,
      padding: "8px 14px",
      "&.Mui-disabled": {
        WebkitTextFillColor: "#1F2937",
      },
      "&.MuiInputBase-input": {
        padding: "8px 14px",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#E5E7EB",
      borderRadius: "8px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#E5E7EB",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#2563EB",
    },
  };

  const menuItemStyles = {
    fontSize: "14px",
    fontWeight: 500,
    minHeight: "40px",
    padding: "8px 14px",
  };

  const formControlStyles = {
    "& .MuiFormLabel-root": {
      color: "#6B7280",
      fontSize: "14px",
      marginBottom: "4px",
    },
  };

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          mt: 2,
        }}
      >
        <FormControl fullWidth sx={formControlStyles}>
          <Typography
            variant="h5"
            sx={{
              fontSize: "14px",
              color: "#6B7280",
              mb: 1,
              fontWeight: 500,
            }}
          >
            {t("talent_filters.category")}
          </Typography>
          <Select
            value={filters.category || ""}
            onChange={(e) => onFilterChange("category", e.target.value)}
            displayEmpty
            disabled={loadingOptions.professions}
            sx={selectStyles}
            placeholder={t("talent_filters.select_category")}
          >
            <MenuItem value="" sx={menuItemStyles}>
              {t("all")}
            </MenuItem>
            {professions.map((profession) => (
              <MenuItem
                key={profession.id}
                value={profession.id}
                sx={menuItemStyles}
              >
                {profession.name}
              </MenuItem>
            ))}
          </Select>
          {loadingOptions.professions && (
            <CircularProgress
              size={20}
              sx={{
                position: "absolute",
                right: 32,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          )}
        </FormControl>

        <FormControl fullWidth sx={formControlStyles}>
          <Typography
            variant="h5"
            sx={{
              fontSize: "14px",
              color: "#6B7280",
              mb: 1,
              fontWeight: 500,
            }}
          >
            {t("talent_filters.country")}
          </Typography>
          <Select
            value={filters.country || ""}
            onChange={(e) => onFilterChange("country", e.target.value)}
            displayEmpty
            disabled={loadingOptions.countries}
            sx={selectStyles}
            placeholder={t("talent_filters.select_country")}
          >
            <MenuItem value="" sx={menuItemStyles}>
              {t("all")}
            </MenuItem>
            {Array.isArray(countries) &&
              countries.map((country) => (
                <MenuItem
                  key={country.isoCode}
                  value={country.isoCode}
                  sx={menuItemStyles}
                >
                  {country.name}
                </MenuItem>
              ))}
          </Select>
          {loadingOptions.countries && (
            <CircularProgress
              size={20}
              sx={{
                position: "absolute",
                right: 32,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          )}
        </FormControl>

        <FormControl fullWidth sx={formControlStyles}>
          <Typography
            variant="h5"
            sx={{
              fontSize: "14px",
              color: "#6B7280",
              mb: 1,
              fontWeight: 500,
            }}
          >
            {t("talent_filters.city")}
          </Typography>
          <Select
            value={filters.city || ""}
            onChange={(e) => onFilterChange("city", e.target.value)}
            displayEmpty
            disabled={loadingOptions.cities || !filters.country}
            sx={selectStyles}
            placeholder={t("talent_filters.select_city")}
          >
            <MenuItem value="" sx={menuItemStyles}>
              {t("all")}
            </MenuItem>
            {Array.isArray(cities) &&
              cities.map((city) => (
                <MenuItem key={city.id} value={city.id} sx={menuItemStyles}>
                  {city.name}
                </MenuItem>
              ))}
          </Select>
          {loadingOptions.cities && (
            <CircularProgress
              size={20}
              sx={{
                position: "absolute",
                right: 32,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          )}
        </FormControl>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="text"
          onClick={onClearFilters}
          sx={{
            textTransform: "none",
            color: "primary.main",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {t("milestone.clear_filters")}
        </Button>
      </Box>
    </Box>
  );
}

TalentFilterFields.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.string,
    country: PropTypes.string,
    city: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  professions: PropTypes.array,
  countries: PropTypes.array,
  cities: PropTypes.array,
  loadingOptions: PropTypes.shape({
    professions: PropTypes.bool,
    countries: PropTypes.bool,
    cities: PropTypes.bool,
  }).isRequired,
};

export default TalentFilterFields;
