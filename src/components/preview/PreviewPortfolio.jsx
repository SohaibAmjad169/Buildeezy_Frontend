import { Box, Typography, Paper, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { colors } from "../../styles/theme";

const PreviewPortfolio = ({ portfolioData }) => {
  const { t } = useTranslation();

  // Default portfolio items if no data is provided
  const defaultPortfolioItems = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
      role: t("profile.portfolio.fields.your_role.placeholder"),
      title: t("profile.portfolio.fields.project_title.placeholder"),
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
      role: t("profile.portfolio.fields.your_role.placeholder"),
      title: t("profile.portfolio.fields.project_title.placeholder"),
    },
  ];

  const items =
    portfolioData?.length > 0 ? portfolioData : defaultPortfolioItems;

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
          mb: 2,
        }}
      >
        {items.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ position: "relative", pb: "75%", overflow: "hidden" }}>
              <img
                src={item.image}
                alt={item.title}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ color: colors.primary, fontWeight: 600 }}
              >
                {t(item.role)}
              </Typography>
              <Typography variant="body1" sx={{ color: colors.primary }}>
                {item.title}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          sx={{
            color: colors.primary,
            borderColor: colors.primary,
            "&:hover": {
              borderColor: colors.primary,
              bgcolor: `${colors.primary}10`,
            },
          }}
          onClick={() => {}}
        >
          {t("profile.preview.see_more")}
        </Button>
      </Box>
    </Box>
  );
};

export default PreviewPortfolio;
