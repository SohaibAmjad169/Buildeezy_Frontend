import { Box, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import MuiTypography from "../../components/common/MuiTypography";
import { useEffect, useState, useRef } from "react";
import {
  getFullUserProfileUrl,
  getSpecialists,
  searchTalents,
} from "../../apis/apiEndPoints";
import ProffecionalCards from "../../components/professionals/ProffecionalCards";
import { USER_TYPES } from "../../utils/constants/login";
import ProfessionalProfilePopup from "../../components/professionals/ProfessionalProfilePopup";
import SearchBox from "../../components/appBar/SearchBox";
import Divider from "@mui/material/Divider";
import SeeMore from "../../components/common/SeeMore";

function Professionals() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [profile, setProfile] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Removed old inefficient frontend filtering - now using backend search

  async function fetchProfessionals(currentPage = 1, append = false) {
    if (append) {
      setIsMoreLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getSpecialists({ page: currentPage });
      const newUsers = res.data.data;
      const meta = res.data.meta;

      setTotalPages(meta.totalPages);
      setUsers((prev) => (append ? [...prev, ...newUsers] : newUsers));

      if (!append) {
        setPage(1); // Reset to first page when not appending
      }
    } catch {
      if (!append) setUsers([]);
    } finally {
      append ? setIsMoreLoading(false) : setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfessionals(1, false); // first page, don't append
  }, []);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Backend search when debouncedSearch changes
  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await searchTalents({
          search: debouncedSearch,
          userType: ['contractor', 'specialist'],
          page: 1,
          pageSize: 50,
        });
        
        setSearchResults(response.data.data || []);
        console.log('Search results:', response.data.data?.length || 0);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }

    performSearch();
  }, [debouncedSearch]);

  const handleSeeMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProfessionals(nextPage, true); // append new data
  };

  // Use search results when searching, otherwise show all professionals
  const displayUsers = search ? searchResults : users;

  const handleCardClick = async (user) => {
    setProfileLoading(true)
    try {
      const response = await getFullUserProfileUrl(user.id);
      setProfile(response.data.data);
      setProfileLoading(false)
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false)
    }
  };

  return (
    <Box
      sx={{ height: "100%", p: { xs: 2, sm: (theme) => theme.spacing(3, 4) } }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Box sx={{ mb: { xs: 2, sm: 0 } }}>
          <MuiTypography variant="h2">
            {t("professionals.title", "Professionals")}
          </MuiTypography>
        </Box>
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder={t("professionals.search_placeholder", "Search talent")}
        />
      </Box>
      <Divider sx={{ mb: 2.5 }} />
      <Box sx={{ mt: 0 }}>
        {/* Show loading for initial load or search */}
        {(loading && !search) || (searchLoading && search) ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : displayUsers.length === 0 ? (
          <MuiTypography variant="body1" color="text.secondary" align="center">
            {search 
              ? t("professionals.no_search_results", `No professionals found for "${search}".`)
              : t("professionals.no_results", "No professionals found.")
            }
          </MuiTypography>
        ) : (
          <>
            {/* Show search results count */}
            {search && (
              <MuiTypography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                {`Found ${displayUsers.length} professional${displayUsers.length !== 1 ? 's' : ''} for "${search}"`}
              </MuiTypography>
            )}
            
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: "24px",
                width: "100%",
                justifyContent: "center",
              }}
            >
              {displayUsers.map((user) => (
                <Box key={user?.id} sx={{ minWidth: 0, display: "flex" }}>
                  <ProffecionalCards
                    profile={user}
                    onClick={() => {
                      handleCardClick(user);
                      setDialogOpen(true);
                    }}
                    cardWidth="100%"
                    // showCompletionBadge={user.profileCompletionPercentage === 100}
                    showVerificationBadge={user.isVerified}
                  />
                </Box>
              ))}
            </Box>
            
            {/* Only show "See More" when not searching */}
            {!search && (
              <SeeMore
                isShow={page < totalPages}
                isLoading={isMoreLoading}
                handleSeeMore={handleSeeMore}
              />
            )}
          </>
        )}
      </Box>

      <ProfessionalProfilePopup
        open={dialogOpen}
        user={profile}
        onClose={() => {
          setDialogOpen(false);
          setProfile(null);
        }}
        isLoading={profileLoading}
      />
    </Box>
  );
}

export default Professionals;
