import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  Button,
  Typography,
  Collapse,
} from "@mui/material";
import { SearchNormal1, CloseCircle, Setting2 } from "iconsax-react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  getCountry,
  getCity,
  getProductCategoriesUrl,
} from "../../apis/apiEndPoints";

import UsersList from "./UsersList";
import TalentFilterFields from "./TalentFilterFields";

function FindMoreTalentsDialog({
  open,
  onClose,
  users,
  onSelectUser,
  loading,
  searchQuery,
  onSearchChange,
}) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    profession: "",
    country: "",
    city: "",
  });
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState({
    countries: false,
    cities: false,
    professions: false,
  });

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingOptions((prev) => ({ ...prev, countries: true }));
      try {
        const response = await getCountry();
        const countryList = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
        setCountries(countryList);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountries([]);
      }
      setLoadingOptions((prev) => ({ ...prev, countries: false }));
    };

    const fetchProfessions = async () => {
      setLoadingOptions((prev) => ({ ...prev, professions: true }));
      try {
        const response = await getProductCategoriesUrl();
        const professionList = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
        setProfessions(professionList);
      } catch (error) {
        console.error("Error fetching professions:", error);
        setProfessions([]);
      }
      setLoadingOptions((prev) => ({ ...prev, professions: false }));
    };

    fetchCountries();
    fetchProfessions();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!filters.country) {
        setCities([]);
        return;
      }

      setLoadingOptions((prev) => ({ ...prev, cities: true }));
      try {
        const response = await getCity(filters.country);
        const cityList = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
        setCities(cityList);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      }
      setLoadingOptions((prev) => ({ ...prev, cities: false }));
    };

    fetchCities();
  }, [filters.country]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => {
      // If country changes, reset city
      if (filterName === "country") {
        return {
          ...prev,
          [filterName]: value,
          city: "",
        };
      }
      return {
        ...prev,
        [filterName]: value,
      };
    });
  };

  const handleClearFilters = () => {
    setFilters({
      profession: "",
      country: "",
      city: "",
    });
  };

  // Apply filters to users
  const filteredUsers = users?.filter((user) => {
    if (filters.profession && user.profession !== filters.profession)
      return false;
    if (filters.country && user.country !== filters.country) return false;
    if (filters.city && user.city !== filters.city) return false;
    return true;
  });

  // Convert number IDs to strings for UsersList
  const processedUsers = filteredUsers?.map((user) => ({
    ...user,
    id: user.id?.toString(),
  }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          p: 2,
          width: { xs: "100%", sm: "600px", md: "800px" },
          height: { xs: "100%", sm: "500px", md: "600px" },
          maxWidth: { xs: "100%", sm: "600px", md: "800px" },
          maxHeight: { xs: "100%", sm: "500px", md: "600px" },
          m: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={{ p: 0, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {t("milestone.find_more_talents")}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label={t("common.close")}
            sx={{
              color: "grey.500",
              "&:hover": { color: "grey.700" },
            }}
          >
            <CloseCircle size={24} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          height: "calc(100% - 80px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search and Filters Section */}
        <Box sx={{ mb: 3 }}>
          {/* Search Bar with Filters Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: showFilters ? 2 : 0,
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "background.paper",
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "#D0D5DD",
                boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
                p: "4px 4px 4px 12px",
                height: "44px",
              }}
            >
              <TextField
                fullWidth
                placeholder={t("milestone.search_talent")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label={t("milestone.search_talent")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchNormal1
                        size={20}
                        color="#667085"
                        style={{ marginRight: "8px" }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    border: "none",
                    height: "36px",
                    "& fieldset": {
                      border: "none",
                    },
                    "& input": {
                      padding: "8px 0",
                      fontSize: "14px",
                      color: "#101828",
                      "&::placeholder": {
                        color: "#667085",
                        opacity: 1,
                        fontSize: "14px",
                      },
                    },
                  },
                }}
              />
            </Box>
            <Button
              variant={showFilters ? "contained" : "outlined"}
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<Setting2 size={20} />}
              aria-label={t("milestone.filters")}
              sx={{
                height: "44px",
                textTransform: "none",
                minWidth: "100px",
              }}
            >
              {t("milestone.filters")}
            </Button>
          </Box>

          {/* Filters Section */}
          <Collapse in={showFilters}>
            <TalentFilterFields
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              professions={professions}
              countries={countries}
              cities={cities}
              loadingOptions={loadingOptions}
            />
          </Collapse>
        </Box>

        {/* Results Section */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <UsersList
            users={processedUsers}
            onSelectUser={onSelectUser}
            loading={loading}
            emptyMessage={t("talent_filters.no_talents_found")}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

FindMoreTalentsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  users: PropTypes.array,
  onSelectUser: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
};

export default FindMoreTalentsDialog;
