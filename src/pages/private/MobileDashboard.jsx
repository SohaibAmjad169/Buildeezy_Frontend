import { Box, Divider } from "@mui/material";
import MuiTypography from "../../components/common/MuiTypography";
import DashboardCard from "../../components/dashboard/DashboardCard";
import SearchBox from "../../components/appBar/SearchBox";
import { useEffect, useState } from "react";
import ProffecionalCards from "../../components/professionals/ProffecionalCards";
import { getUsers } from "../../apis/apiEndPoints";
import { USER_TYPES } from "../../utils/constants/login";
import Overview from "./Overview";
import { useTranslation } from "react-i18next";

export default function MobileDashboard({
  profileData,
  searchQuery,
  setSearchQuery,
  cards,
  greeting,
  allowedUserTypes,
  user,
}) {
  const { t } = useTranslation();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(false);




  useEffect(() => {
    async function fetchProfessionals() {
      setLoading(true);
      try {
        const res = await getUsers();
        setProfessionals(
          res.data.data.filter(
            (u) =>
              u.userType === USER_TYPES.specialist ||
              u.userType === USER_TYPES.contractor
          )
        );
      } catch {
        setProfessionals([]);
      } finally {
        setLoading(false);
        setInit(true);
      }
    }
    fetchProfessionals();
  }, []);


  const filteredProfessionals = professionals.filter((u) => {
    const searchLower = searchQuery.toLowerCase();
    const name = (u?.firstName + " " + u.lastName).toLowerCase();
    const category = (u?.category || "").toLowerCase();
    const description = (u?.description || "").toLowerCase();
    const slogan = (u?.profileDesign?.content?.slogan || "").toLowerCase();
    return (
      name?.includes(searchLower) ||
      category?.includes(searchLower) ||
      description?.includes(searchLower) ||
      slogan?.includes(searchLower)
    );
  });

  return (
    <Box sx={{ mb: 2 }}>
      <MuiTypography variant="h1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
        {`${greeting}, ${profileData?.firstName || "User"}!`}
      </MuiTypography>

      <Divider sx={{ mt: 2 }} />
      <Box sx={{ width: "100%", mt: 2, mb: 2 }}>
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("milestone.search_talent")}
        />
      </Box>
      {searchQuery && (
        <Box sx={{ mt: 2 }}>
          {loading && <MuiTypography>Loading...</MuiTypography>}
          {!loading && filteredProfessionals.length === 0 && init && (
            <MuiTypography>No professionals found.</MuiTypography>
          )}
          {!loading && filteredProfessionals.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {filteredProfessionals.map((user) => (
                <ProffecionalCards key={user.id} profile={user} />
              ))}
            </Box>
          )}
        </Box>
      )}


      <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
        {(Array.isArray(cards) ? cards : []).map(({ id, isDisabled, onClick, title, ...rest }) => (
          <DashboardCard
            key={id}
            title={title}
            disabled={isDisabled}
            onClick={onClick}
            {...rest}
          />
        ))}
      </Box>
      {allowedUserTypes?.includes(user?.userType) && (
        <Box sx={{ height: "100%", my: 2.5 }}>
          <MuiTypography variant="h2" sx={{ mb: 0 }}>
            {t("overview.overview")}
          </MuiTypography>
          <Divider sx={{ my: 2.5 }} />
          <Overview />
        </Box>
      )}
    </Box>
  );
}
