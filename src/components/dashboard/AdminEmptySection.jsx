import { Box, InputBase, useTheme } from "@mui/material";
import { useState } from "react";
import MuiTypography from "../common/MuiTypography";
import { SearchNormal1 } from "iconsax-react";
import { colors } from "../../styles/theme";

export default function AdminEmptySection({ sectionTitles, mode }) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {sectionTitles.map((sectionTitle, idx) => (
        <Box
          key={idx}
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
            {sectionTitle}
          </MuiTypography>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              border: "1px solid",
              borderColor:
                mode === "dark"
                  ? theme.palette.grey[700]
                  : theme.palette.grey[300],
              borderRadius: 5,
              px: 2,
              height: 40,
              backgroundColor:
                mode === "dark" ? theme.palette.grey[900] : theme.palette.grey,
            }}
          >
            <SearchNormal1
              size={18}
              style={{
                marginRight: 8,
                color: colors.grey500,
              }}
            />
            <InputBase
              placeholder="Search..."
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
          <Box
            sx={{ maxHeight: 300, minHeight: 300, overflowY: "auto", pr: 1 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              No Data Available
            </Box>
          </Box>
        </Box>
      ))}
    </>
  );
}
