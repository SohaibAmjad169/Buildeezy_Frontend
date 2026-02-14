import { Box, InputBase, useTheme } from "@mui/material";
import { useState } from "react";
import MuiTypography from "../common/MuiTypography";
import { colors } from "../../styles/theme";
import { SearchNormal1 } from "iconsax-react";
import { countryNameToCode } from "../../utils/constants/dashboard";

export default function AdminDashboardMarketStats({ title, stats, mode }) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStats = stats.filter((item) => {
    const query = (searchQuery || "").toLowerCase();
    const country = (item.country || "").toLowerCase();
    const total = String(item.total || "").toLowerCase();
    const growth = String(item.percentageGrowth || "").toLowerCase();

    return (
      country.includes(query) || total.includes(query) || growth.includes(query)
    );
  });

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid #131A471F",
        borderRadius: 4,
        backgroundColor:
          mode === "dark"
            ? theme.palette.grey[900]
            : theme.palette.common.white,
        backdropFilter: "blur(50px)",
      }}
    >
      <MuiTypography
        variant="h3"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: mode === "dark" ? colors.white : colors.black,
        }}
      >
        {title}
      </MuiTypography>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          border: "1px solid",
          borderColor:
            mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[300],
          borderRadius: 5,
          px: 2,
          height: 40,
          backgroundColor:
            mode === "dark" ? theme.palette.grey[900] : theme.palette.grey,
        }}
      >
        <SearchNormal1
          size={18}
          style={{ marginRight: 8, color: colors.grey500 }}
        />
        <InputBase
          placeholder="Search country..."
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            color: mode === "dark" ? colors.white : colors.black,
            "&::placeholder": {
              color: theme.palette.text.secondary,
              opacity: 1,
            },
          }}
        />
      </Box>
      {filteredStats.length === 0 ? (
        <MuiTypography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          No market data found.
        </MuiTypography>
      ) : (
        <Box sx={{ maxHeight: 300, minHeight: 300, overflowY: "auto", pr: 1 }}>
          {filteredStats.map((item, i) => {
            function toPascalCase(str) {
              return str
                ?.toLowerCase()
                .trim()
                .replace(/\s+/g, " ") // normalize spaces
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join("");
            }
            const rawCountry = item.country; // user input
            const pascalCaseName = toPascalCase(rawCountry);

            const countryCode = countryNameToCode[pascalCaseName];
            const flagUrl = countryCode
              ? `https://flagcdn.com/${countryCode}.svg`
              : ``;

            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  px: 1.5,
                  borderRadius: 1,
                  transition: "box-shadow 0.3s ease, transform 0.3s ease",
                  "&:hover": {
                    backgroundColor:
                      mode === "dark" ? colors.grey300 : colors.grey300,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <img
                    src={flagUrl}
                    alt={item.country}
                    width={32}
                    height={32}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                  <Box>
                    <MuiTypography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {item.total}
                    </MuiTypography>
                    <MuiTypography sx={{ fontSize: 11, color: "#7B7B7B" }}>
                      {item.country ?? "Country name not available"}
                    </MuiTypography>
                  </Box>
                </Box>
                <MuiTypography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color:
                      parseFloat(item.percentageGrowth) > 0
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  }}
                >
                  {item.percentageGrowth}
                </MuiTypography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
