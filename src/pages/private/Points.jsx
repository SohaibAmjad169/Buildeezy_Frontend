import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PointsTabsAndSearch from "../../components/points/PointsTabsAndSearch";
import usePointsCards from "../../hooks/usePointsCards";
import { useSelector } from "react-redux";

// Sample data
const data = [
  {
    date: "22 Jan 2024",
    project: "Content curating app",
    quote: "Basic Plan",
    hired: "Yes",
    walletCredit: "$545,445",
  },
  {
    date: "22 Jan 2024",
    project: "Design software",
    quote: "Basic Plan",
    hired: "No",
    walletCredit: "$120,000",
  },
  {
    date: "22 Jan 2024",
    project: "Data prediction",
    quote: "Basic Plan",
    hired: "TBC",
    walletCredit: "$120,000",
  },
];



export default function Points() {
  const { t } = useTranslation();
  const { profileData } = useSelector((state) => state.profile);    
  const [cards] = usePointsCards(
    profileData.userType,
  );
  
  const cardData = [
    { title: t("accounts.wallet_receipts"), amount: "$54,522" },
    { title: t("accounts.wallet_payouts"), amount: "$8,454" },
    { title: t("accounts.wallet_balance"), amount: "$8,545,454" },
];

  return (
    <Box p={3}>
      {/* Page Title and Search Bar in one row */}

      <PointsTabsAndSearch cards={cards}/>

      {/* Cards */}

      <Grid container spacing={3} mb={4}>
        {cardData.map((item, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: "12px",
                minHeight: "107px",
                width: "100%",
                padding: "20px",
              }}
            >
              <CardContent
                sx={{
                  p: "0 !important", // removes all padding including bottom
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500
                  }}
                  color="textSecondary"
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: {
                      xs: "24px",
                      sm: "26px",
                      md: "28px",
                      lg: "32px",
                    },
                    fontWeight: 600
                  }}
                >
                  {item.amount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Table */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: "12px",
          width: "100%",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#F9FAFB",
                "& .MuiTableCell-root": {
                  fontSize: "12px",
                  py: 1,
                  color: "text.secondary",
                },
              }}
            >
              <TableCell>{t("accounts.date")}</TableCell>
              <TableCell>{t("accounts.project")}</TableCell>
              <TableCell>{t("accounts.quote")}</TableCell>
              <TableCell>{t("accounts.hired")}</TableCell>
              <TableCell>{t("accounts.wallet_credit")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  py: 3,
                  "& .MuiTableCell-root": {
                    py: 3,
                    color: "text.secondary",
                  },
                }}
              >
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.project}</TableCell>
                <TableCell>{row.quote}</TableCell>
                <TableCell>
                  <Chip
                    label={row.hired}
                    variant="outlined"
                    size="small"
                    sx={{
                      fontWeight: 500,
                      color:
                        row.hired === "Yes"
                          ? "#027A48"
                          : row.hired === "No"
                          ? "#B54708"
                          : "#026AA2",
                      backgroundColor:
                        row.hired === "Yes"
                          ? "#ECFDF3"
                          : row.hired === "No"
                          ? "#FFFAEB"
                          : "#F0F9FF",
                      borderColor:
                        row.hired === "Yes"
                          ? "#A6F4C5"
                          : row.hired === "No"
                          ? "#FEC84B"
                          : "#84CAFF",
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: "#101828 !important",
                  }}
                >
                  {row.walletCredit}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
