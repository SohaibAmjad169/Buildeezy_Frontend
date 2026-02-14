import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from "react-i18next";
import { 
  Box, 
  Grid, 
  Divider, 
  Typography, 
  IconButton,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const CatalogueTabsAndSearch = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  activeFilters = [],
  onFilterRemove,
  onMobileFiltersOpen,
  totalItems = 0,
  showBackButton = false,
  onBack
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <Box mb={3}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid item>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                onClick={showBackButton ? onBack : undefined}
                sx={{
                  fontSize: {
                    xs: "16px",
                    sm: "18px", 
                    md: "20px",
                    lg: "22px",
                  },
                  cursor: showBackButton ? "pointer" : "default",
                  fontWeight: 550,
                  whiteSpace: "nowrap",
                }}
              >
                {t("catalogue.catalogue")}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                ({totalItems} items)
              </Typography>
            </Box>
          </Grid>

          {/* Search bar */}
          <Grid item sx={{ flexGrow: 1 }} xs={12} sm={6} md={4} lg={3.7}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "background.paper",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "divider",
                height: "40px",
                pl: 1.5,
                pr: 2,
                gap: 1,
                width: "100%",
              }}
            >
              <SearchIcon sx={{ color: "text.disabled", fontSize: "20px" }} />
              <input
                type="text"
                placeholder="Search furniture..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  color: "inherit",
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Active Filters Row */}
        {activeFilters.length > 0 && (
          <Box mt={2}>
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Active filters:
              </Typography>
              {activeFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={filter.label}
                  size="small"
                  onDelete={() => onFilterRemove(filter)}
                  sx={{ 
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Controls Bar */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mt={activeFilters.length > 0 ? 2 : 3}
        >
          <Box display="flex" gap={2} alignItems="center">
            {isMobile && (
              <IconButton 
                onClick={onMobileFiltersOpen}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                <FilterListIcon />
              </IconButton>
            )}
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => onSortChange(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* View Mode Toggle could go here if needed */}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />
    </>
  );
};

export default CatalogueTabsAndSearch;