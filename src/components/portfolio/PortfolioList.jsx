import { Box, Grid, Tab, Tabs, Button, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Add } from "iconsax-react";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import MuiTypography from "../common/MuiTypography";
import PortfolioCard from "./PortfolioCard";
import { ROUTES } from "../../utils/constants/route";
import { colors } from "../../styles/theme";
import PortfolioImageDialog from "./PortfolioImageDialog";

export default function PortfolioList({
  status = "published",
  portfolios = [],
  loading = false,
  onStatusChange,
  onEdit,
  onDelete,
  onPortfolioUpdated,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openImage, setOpenImage] = useState(null);

  const handleTabChange = (event, newValue) => {
    onStatusChange(newValue);
  };

  const handleAddProject = () => {
    navigate(`/${ROUTES.addPortfolio}`);
  };

  // Filter portfolios based on status
  const filteredPortfolios = portfolios.filter(
    (portfolio) => portfolio.status?.toLowerCase() === status?.toLowerCase()
  );

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <MuiTypography variant="body1">{t("loading")}</MuiTypography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={status}
          onChange={handleTabChange}
          sx={(theme) => ({
            mb: 4,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "h5",
              minWidth: 120,
            },
              borderColor:
          theme.palette.mode === "dark" ? theme.palette.divider : "divider",
        background:
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : undefined,
          })}
        >
          <Tab
            label={t("profile.portfolio.status.published")}
            value="published"
            sx={{ textTransform: "none" }}
          />
          <Tab label={t("profile.portfolio.status.draft")} value="draft" sx={{ textTransform: "none" }} />
        </Tabs>
        <Divider sx={{ mt: 2 }} />
      </Box>

      {!filteredPortfolios.length ? (
        <Box
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            backgroundColor: "background.paper",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <SearchIcon sx={{ fontSize: 48, color: "text.secondary" }} />
          <Box>
            <MuiTypography variant="h6" sx={{ mb: 1 }}>
              {status === "published"
                ? t("profile.portfolio.no_published_portfolio")
                : t("profile.portfolio.no_draft_projects")}
            </MuiTypography>
            <MuiTypography variant="body2" color="text.secondary">
              {t("profile.portfolio.hire_rate")}
            </MuiTypography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add size={20} />}
            onClick={handleAddProject}
            sx={{
              borderRadius: "8px",
              backgroundColor: colors.primary,
              "&:hover": {
                backgroundColor: colors.primary800,
              },
              mt: 2,
            }}
          >
            {t("profile.portfolio.add_title")}
          </Button>
        </Box>
      ) : (
        <Grid
          container
          spacing={3}
          sx={{
            width: "100%",
            margin: 0,
            "& .MuiGrid-item": {
              paddingTop: "24px",
              paddingBottom: "24px",
              paddingLeft: 0,
              paddingRight: "24px",
              "&:nth-of-type(2n)": {
                paddingRight: 0,
              },
            },
          }}
        >
          {filteredPortfolios.map((portfolio) => (
            <Grid item xs={12} sm={12} md={6} key={portfolio.projectId}>
              <PortfolioCard
                {...portfolio}
                showActions={true}
                onEdit={onEdit}
                onDelete={onDelete}
                onPortfolioUpdated={onPortfolioUpdated}
                onImageClick={(img) => setOpenImage(img)}
                onClick={() =>
                  navigate(`/profile/portfolio/view/${portfolio.projectId}`)
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
      <PortfolioImageDialog
        open={!!openImage}
        image={openImage}
        onClose={() => setOpenImage(null)}
      />
    </Box>
  );
}

PortfolioList.propTypes = {
  status: PropTypes.oneOf(["published", "draft"]),
  portfolios: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  onStatusChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onPortfolioUpdated: PropTypes.func,
};
