import dayjs from "dayjs";
import { colors } from "../../../styles/theme";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { Box, Grid, useTheme } from "@mui/material";
import { setAlert, setLoading } from "../../../redux/configSlice";
import { getAdminDashboardUrl } from "../../../apis/apiEndPoints";
import MuiTypography from "../../../components/common/MuiTypography";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";
import AdminEmptySection from "../../../components/dashboard/AdminEmptySection";
import AdminDashboardCard from "../../../components/dashboard/AdminDashboardCard";
import AdminDashboardDatePicker from "../../../components/dashboard/AdminDashboardDatePicker";
import AdminDashboardMarketStats from "../../../components/dashboard/AdminDashboardMarketStats";

function Dashboard() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { loading } = useSelector((state) => state.config);

  const ADMIN_DASHBOARD_CARDS = [
    {
      id: "totalRevenue",
      title: t("admin_dashboard.total_revenue"),
    },
    {
      id: "totalUsers",
      title: t("admin_dashboard.total_users"),
    },
    {
      id: "totalAdsRevenue",
      title: t("admin_dashboard.total_sales_from_ads"),
    },
    {
      id: "catalogOrders",
      title: t("admin_dashboard.total_catalogue_orders"),
    },
  ];

  const MARKET_SECTIONS = [
    {
      title: t("admin_dashboard.total_revenue_by_market"),
      key: "totalRevenue",
    },
    {
      title: t("admin_dashboard.total_user_by_market"),
      key: "totalUsers",
    },
    {
      title: t("admin_dashboard.total_ad_sales"),
      key: "totalAdsRevenue",
    },
    {
      title: t("admin_dashboard.total_talent_sales"),
      key: "talentSales",
    },
    {
      title: t("admin_dashboard.total_catalogue_sales"),
      key: "catalogOrders",
    },
  ];

  const [cards, setCards] = useState(ADMIN_DASHBOARD_CARDS);
  const [marketStats, setMarketStats] = useState({});

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, "day"),
    endDate: dayjs(),
  });

  const fetchDashboardData = useCallback(
    async (startDate, endDate) => {
      try {
        dispatch(setLoading(true));

        const { data: res } = await getAdminDashboardUrl({
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        });

        const newCards = ADMIN_DASHBOARD_CARDS.map((card) => ({
          ...card,
          value: res.data?.[card.id] || 0,
        }));

        const market = res.data.market || {};
        const normalizedMarket = {
          totalRevenue: market.totalRevenue || [],
          totalUsers: market.totalUsers || [],
          totalAdsRevenue: market.adsRevenue || [],
          talentSales: market.talentSales || [],
          catalogOrders: market.catalogOrders || [],
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
      fetchDashboardData(startDate, endDate);
    },
    [fetchDashboardData]
  );

  useEffect(() => {
    fetchDashboardData(dateRange.startDate, dateRange.endDate);
  }, []);

  if (loading) {
    return <AdListSkeleton />;
  }

  return (
    <Box
      sx={{
        color: theme.palette.text.primary,
        minHeight: "100vh",
      }}
    >
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
          {t("admin_dashboard.title")}
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
            // Pass initial values to date picker
            initialStart={dateRange.startDate.toDate()}
            initialEnd={dateRange.endDate.toDate()}
          />
        </Box>
      </Box>

      {/* Cards */}
      <Grid container spacing={2} mt={1}>
        {cards.map(({ title, value }, idx) => (
          <Grid item key={idx} xs={12} sm={6} md={3}>
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

export default Dashboard;
