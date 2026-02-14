import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { colors } from "../../../styles/theme";
import { Box, Grid, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { ALERT_TYPE } from "../../../utils/constants/config";
import { getAdminRevenueUrl } from "../../../apis/apiEndPoints";
import { setAlert, setLoading } from "../../../redux/configSlice";
import MuiTypography from "../../../components/common/MuiTypography";
import AdListSkeleton from "../../../components/skeleton/AdListSkeleton";
import { countryNameToCode } from "../../../utils/constants/dashboard";
import AdminEmptySection from "../../../components/dashboard/AdminEmptySection";
import AdminDashboardCard from "../../../components/dashboard/AdminDashboardCard";
import AdminDashboardDatePicker from "../../../components/dashboard/AdminDashboardDatePicker";
import AdminDashboardMarketStats from "../../../components/dashboard/AdminDashboardMarketStats";

function Revenue() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { loading } = useSelector((state) => state.config);

  const ADMIN_REVENUE_CARDS = [
    { id: "totalRevenue", title: t("admin_revenue.total_revenue") },
    { id: "totalAdSales", title: t("admin_revenue.total_ad_sales") },
    {
      id: "totalCatalogueSales",
      title: t("admin_revenue.total_catalogue_sales"),
    },
    { id: "totalTalentSales", title: t("admin_revenue.total_talent_sales") },
  ];

  const MARKET_SECTIONS = [
    {
      title: t("admin_revenue.total_revenue_by_market"),
      key: "totalRevenue",
    },
    { title: t("admin_revenue.ad_sales_by_market"), key: "adsRevenue" },
    {
      title: t("admin_revenue.catalogue_sales_by_market"),
      key: "catalogueRevenue",
    },
    {
      title: t("admin_revenue.talent_sales_by_market"),
      key: "talentRevenue",
    },
    {
      title: t("admin_revenue.revenue_per_user_market"),
      key: "revenuePerUser",
    },
  ];

  const [cards, setCards] = useState(ADMIN_REVENUE_CARDS);
  const [marketStats, setMarketStats] = useState([]);

  // Initialize with last 30 days range
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, "day"),
    endDate: dayjs(),
  });

  const fetchRevenueData = useCallback(
    async (startDate, endDate) => {
      try {
        dispatch(setLoading(true));

        const { data: res } = await getAdminRevenueUrl({
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        });

        const newCards = cards.map((card) => ({
          ...card,
          value: res.data?.[card.id] || 0,
        }));

        const normalizeMarketStats = (data = []) =>
          data.map((item) => ({
            country: item.country || "",
            total: item.total ?? 0,
            percentageGrowth: item.percentageGrowth || "0%",
            flag: countryNameToCode[item.country] || "us",
          }));

        const normalizedMarket = {
          totalRevenue: normalizeMarketStats(res.data.market.totalRevenue),
          adsRevenue: normalizeMarketStats(res.data.market.adsRevenue),
          catalogueRevenue: normalizeMarketStats(
            res.data.market.catalogueRevenue
          ),
          talentRevenue: normalizeMarketStats(res.data.market.talentRevenue),
          revenuePerUser: normalizeMarketStats(res.data.market.revenuePerUser),
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

  // Update URL parameters and fetch data
  const updateUrlParams = useCallback(
    (start, end) => {
      const startDate = dayjs(start);
      const endDate = dayjs(end);

      // Update local state
      setDateRange({ startDate, endDate });

      // Fetch data with new date range
      fetchRevenueData(startDate, endDate);
    },
    [fetchRevenueData]
  );

  useEffect(() => {
    fetchRevenueData(dateRange.startDate, dateRange.endDate);
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
          {t("admin_revenue.title")}
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

      <Grid container spacing={2} mt={1}>
        {cards.map(({ title, value, id }) => (
          <Grid item key={id} xs={12} sm={6} md={3}>
            <AdminDashboardCard title={title} value={value} mode={mode} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mt={1}>
        {MARKET_SECTIONS.map(({ title, key }) => {
          const stats = marketStats[key] || [];

          return (
            <Grid item md={4} key={key}>
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

export default Revenue;
