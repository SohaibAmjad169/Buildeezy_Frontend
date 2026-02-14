import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { Box, Typography, Grid, Divider } from "@mui/material";
import PointsCard from "./PointsCard";
const PointsTabsAndSearch = ({ cards }) => {
  const { t } = useTranslation();

  return (
    <>
      <Box mb={3}>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          wrap="nowrap"
          spacing={2}
        >
          <Grid item>
            <Typography
              sx={{
                fontSize: {
                  xs: "20px",
                  sm: "24px",
                  md: "28px",
                  lg: "30px",
                },
                fontWeight: 600,
                fontFamily: "Inter",
                whiteSpace: "nowrap",
              }}
            >
              {t("accounts.points")}
            </Typography>
          </Grid>

          {/* Search Component */}
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
                placeholder={t("accounts.search")}
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
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box
        sx={{ my: 3, display: "flex", flexWrap: "wrap", gap: 2 }}
        container
        spacing={2}
        justifyContent={{ xs: "center", sm: "flex-end" }}
      >
        {cards?.map(({ id, isDisabled, onClick, ...rest }) => (
          <PointsCard
            key={id}
            disabled={isDisabled}
            onClick={onClick}
            {...rest} 
          />
        ))}
      </Box>
    </>
  );
};

export default PointsTabsAndSearch;
