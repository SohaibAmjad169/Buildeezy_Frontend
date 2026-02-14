import dayjs from "dayjs";
import { Box, Grid } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { colors } from "../../../styles/theme";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { setAlert, setLoading } from "../../../redux/configSlice";
import { getAdminUsersDataUrl } from "../../../apis/apiEndPoints";
import MuiTypography from "../../../components/common/MuiTypography";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";
import AdminEmptySection from "../../../components/dashboard/AdminEmptySection";
import AdminDashboardCard from "../../../components/dashboard/AdminDashboardCard";
import AdminDashboardDatePicker from "../../../components/dashboard/AdminDashboardDatePicker";
import AdminDashboardMarketStats from "../../../components/dashboard/AdminDashboardMarketStats";

function Users() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { loading } = useSelector((state) => state.config);

  const ADMIN_USERS_CARDS = [
    { id: "totalUsers", title: t("admin_users.total_users") },
    { id: "totalClients", title: t("admin_users.total_clients") },
    { id: "totalContractors", title: t("admin_users.total_contractors") },
    { id: "totalSpecialist", title: t("admin_users.total_specialists") },
    { id: "totalVendors", title: t("admin_users.total_vendors") },
  ];

  const MARKET_SECTIONS = [
    { title: t("admin_users.total_users_by_market"), key: "totalUsers" },
    { title: t("admin_users.clients_by_market"), key: "totalClients" },
    { title: t("admin_users.contractors_by_market"), key: "totalContractors" },
    { title: t("admin_users.specialists_by_market"), key: "totalSpecialist" },
    { title: t("admin_users.vendors_by_market"), key: "totalVendors" },
  ];

  const [cards, setCards] = useState(ADMIN_USERS_CARDS);
  const [marketStats, setMarketStats] = useState([]);

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, "day"),
    endDate: dayjs(),
  });

  const fetchUsersData = useCallback(
    async (startDate, endDate) => {
      try {
        dispatch(setLoading(true));
        const { data: res } = await getAdminUsersDataUrl({
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        });

        const newCards = cards.map((card) => ({
          ...card,
          value: res.data?.[card.id] || 0,
        }));

        const market = res.data.market || {};
        const normalizedMarket = {
          totalUsers: market.totalUsers || [],
          totalClients: market.totalClients || [],
          totalContractors: market.totalContractors || [],
          totalSpecialist: market.totalSpecialist || [],
          totalVendors: market.totalVendors || [],
        };

        setCards(newCards);
        setMarketStats(normalizedMarket);
      } catch (err) {
        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: err.message,
          })
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const updateUrlParams = useCallback(
    (start, end) => {
      const startDate = dayjs(start);
      const endDate = dayjs(end);

      setDateRange({ startDate, endDate });
      fetchUsersData(startDate, endDate);
    },
    [fetchUsersData]
  );

  useEffect(() => {
    fetchUsersData(dateRange.startDate, dateRange.endDate);
  }, []);

  if (loading) return <AdListSkeleton />;

  return (
    <Box sx={{ color: theme.palette.text.primary, minHeight: "100vh" }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <MuiTypography
          variant="h1"
          sx={{
            fontWeight: 500,
            lineHeight: 1.6,
            color: mode === "dark" ? colors.white : colors.black,
            fontSize: 20,
          }}
        >
          {t("admin_users.title")}
        </MuiTypography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            width: 342,
          }}
        >
          <AdminDashboardDatePicker
            onChange={updateUrlParams}
            initialStart={dateRange.startDate.toDate()}
            initialEnd={dateRange.endDate.toDate()}
          />
        </Box>
      </Box>

      <Grid container spacing={2} mt={1}>
        {cards.map(({ title, value }, idx) => (
          <Grid item key={idx} xs={12} sm={6} md={2.4}>
            <AdminDashboardCard title={title} value={value} mode={mode} />
          </Grid>
        ))}
      </Grid>

      {/* Market Stats Sections */}
      <Grid container spacing={2} mt={1}>
        {MARKET_SECTIONS.map(({ title, key }, idx) => {
          const stats = marketStats[key] || [];

          return (
            <Grid item md={4} key={idx}>
              {stats.length > 0 ? (
                <AdminDashboardMarketStats
                  title={title}
                  stats={stats}
                  mode={mode}
                />
              ) : (
                <AdminEmptySection sectionTitles={[title]} mode={mode} />
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default Users;
