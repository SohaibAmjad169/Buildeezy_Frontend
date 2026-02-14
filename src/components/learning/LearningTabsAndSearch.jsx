import { Box, Tabs, Tab, Typography, Button, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Define tab values
export const TABS = {
  ALL: "all",
  MY_LEARNINGS: "my_learnings",
  SAVED: "saved",
};

/**
 * Search function to filter learning ads based on search query
 * @param {Array} ads - Array of learning ads to search through
 * @param {string} searchQuery - Search query string
 * @returns {Array} - Filtered array of learning ads
 */
export const searchLearningAds = (ads, searchQuery) => {
  if (!searchQuery.trim()) {
    return ads;
  }

  const query = searchQuery.toLowerCase().trim();
  return ads.filter((ad) => {
    // Search in multiple fields
    const searchableFields = [
      ad.headline,
      ad.description,
      ad.content,
      ad.adType,
      ad.type,
      ...(ad.tags || []),
      ...(ad.audience || []),
    ].filter(Boolean); // Remove null/undefined values

    // Check if any field contains the search query
    return searchableFields.some((field) =>
      field.toLowerCase().includes(query)
    );
  });
};

const LearningTabsAndSearch = ({
  selectedTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  showEmptyState = false,
  emptyStateMessage = "",
  title = "Learning Solutions",
  description = "",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleCreateAd = () => {
    // Navigate to post-an-ad with learningSolution type
    navigate("/post-an-ad", { state: { type: "learningSolution" } });
  };

  return (
    <>
      {/* Header with Title, Search, and Create Ad Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            flex: 1,
            maxWidth: "500px",
            gap: 2,
            width: "100%",
          }}
        >
          {/* Search Component */}
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
              flex: 1,
              minHeight: { xs: "2.5rem" },
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <SearchIcon sx={{ color: "text.disabled", fontSize: "20px" }} />
            <input
              type="text"
              placeholder={t("learning.search_placeholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                minWidth: 0,
                width: "100%",
                fontSize: "14px",
                backgroundColor: "transparent",
                color: "inherit",
              }}
            />
          </Box>

          {/* Create Learning Button - always visible, responsive layout */}
          <Box
            sx={{
              width: { xs: "100%", sm: "auto" },
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-start" },
              mt: { xs: 2, sm: 0 },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateAd}
              sx={{
                borderRadius: "8px",
                px: 4,
                fontWeight: 500,
                fontSize: "12px",
                minHeight: "2.5rem",
                width: { xs: "100%", sm: "auto" },
                maxWidth: { xs: 300, sm: "none" },
              }}
            >
              {t("learning.create_learning")}
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mt: 2, mb: 4 }} />

      {/* Main Tabs */}
      <Box sx={{ width: "100%", mt: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={onTabChange}
          aria-label="wrapped label tabs"
          sx={{
            background:
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : undefined,
            color:
              theme.palette.mode === "dark"
                ? theme.palette.text.primary
                : undefined,
            borderColor:
              theme.palette.mode === "dark" ? theme.palette.divider : "divider",
          }}
        >
          <Tab label={t("learning.tabs.all")} value={TABS.ALL} wrapped />
          <Tab
            label={t("learning.tabs.my_learnings")}
            value={TABS.MY_LEARNINGS}
            wrapped
          />
          <Tab label={t("learning.tabs.saved")} value={TABS.SAVED} wrapped />
        </Tabs>
      </Box>

      {/* Show empty state message if needed */}
      {showEmptyState && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            width: "100%",
            mt: 4,
          }}
        >
          <Typography color="text.secondary">{emptyStateMessage}</Typography>
        </Box>
      )}
    </>
  );
};

LearningTabsAndSearch.propTypes = {
  selectedTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  showEmptyState: PropTypes.bool,
  emptyStateMessage: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default LearningTabsAndSearch;
