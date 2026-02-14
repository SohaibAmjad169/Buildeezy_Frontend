import { Typography, Box } from "@mui/material";
import { Home2 } from "iconsax-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const Breadcrumbs = ({ onBack, onHomeClick, catalogDataList }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();

  // Utility function to remove trailing ID (e.g., `/1`)
  const normalizePath = (path) => path.replace(/\/\d+$/, "");

  const normalizedPath = normalizePath(currentPath);

  let selectedLevel = "none";

  if (normalizedPath === "/catalogue/type") {
    selectedLevel = "type";
  } else if (normalizedPath === "/catalogue/type/sub-catalogue") {
    selectedLevel = "subcatalogue";
  } else if (
    normalizedPath === '/catalogue/type/sub-catalogue/sigle-catalogue'
  ) {
    selectedLevel = "title";
  }


  return (
    <Box display="flex" alignItems="center" gap={1}>
      {/* Home Icon */}
      <Box
        onClick={onHomeClick}
        sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <Home2 size="20" variant="Linear" color="#4B5563" />
      </Box>

      {/* Chevron separator */}
      <Typography color="gray">{">"}</Typography>

      {/* Catalogue (clickable) */}
      <Typography
        onClick={() => onBack("Catalogue")}
        sx={{
          fontSize: {
            xs: "12px",
            sm: "14px",
            md: "16px",
          },
          cursor: "pointer",
          fontWeight: 500,
          whiteSpace: "nowrap",
          color: "#4B5563",
        }}
      >
        {/* Catalogue */}
        {t("catalogue.catalogue")}
      </Typography>

      {/* Chevron separator */}
      <Typography color="gray">{">"}</Typography>

      {/* Current Page (e.g. Bedroom) */}
      <Box
        sx={{
          backgroundColor: selectedLevel !== "type" ? "transparent" : "#F3F4F6",
          padding: "4px 10px",
          borderRadius: "6px",
        }}
      >
        <Typography
          onClick={() => onBack("type")}
          sx={{
            fontSize: {
              xs: "12px",
              sm: "14px",
              md: "16px",
              cursor: "pointer",
            },
            fontWeight: selectedLevel !== "type" ? 500 : 600,
            color: selectedLevel !== "type" ? "#4B5563" : "#111827",
          }}
        >
          {catalogDataList?.categoryName ||
            catalogDataList?.[0]?.category?.title ||
            catalogDataList?.[0]?.categoryName}
        </Typography>
      </Box>

      {(catalogDataList?.[0]?.typeName || catalogDataList?.typeName) && (
        <>
          <Typography color="gray">{">"}</Typography>

          <Box
            sx={{
              backgroundColor:
                selectedLevel !== 'subcatalogue' ? "transparent" : "#F3F4F6",
              padding: "4px 10px",
              borderRadius: "6px",
            }}
          >
            <Typography
              onClick={() => onBack("subcatalogue")}
              sx={{
                fontSize: {
                  xs: "12px",
                  sm: "14px",
                  md: "16px",
                  cursor: "pointer",
                },
                fontWeight: selectedLevel !== "subcatalogue" ? 500 : 600,
                color:
                  selectedLevel !== "subcatalogue" ? "#4B5563" : "#111827",
              }}
            >
              {catalogDataList?.[0]?.typeName || catalogDataList?.typeName}
            </Typography>
          </Box>
        </>
      )}
      {catalogDataList?.title && (
        <>
          <Typography color="gray">{">"}</Typography>

          <Box
            sx={{
              backgroundColor: selectedLevel !== "title" ? "transparent" : "#F3F4F6",
              padding: "4px 10px",
              borderRadius: "6px",
            }}
          >
            <Typography
              onClick={() => onBack("type")}
              sx={{
                fontSize: {
                  xs: "12px",
                  sm: "14px",
                  md: "16px",
                  cursor: "pointer",
                },
                fontWeight: selectedLevel !== "title" ? 500 : 600,
                color: selectedLevel !== "title" ? "#4B5563" : "#111827",
              }}
            >
              {catalogDataList?.title}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Breadcrumbs;
