import { Box, InputBase } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SearchNormal1 } from "iconsax-react";
import { colors } from "../../styles/theme";

export default function SearchBox({
  value,
  onChange,
  placeholder = "Search talent",
}) {
  const theme = useTheme();
  const mode = theme.palette.mode;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: "1px solid",
        borderColor:
          mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[200],
        borderRadius: 5,
        px: 2,
        backgroundColor:
          mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200],
        width: "100%",
        maxWidth: 400,
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          color: theme.palette.text.primary,
          width: "100%",
          fontSize: 16,
          "& input": {
            color: theme.palette.text.primary,
          },
          "&::placeholder": {
            color: theme.palette.text.secondary,
            opacity: 1,
          },
          "& input::placeholder": {
            color: theme.palette.text.secondary,
            opacity: 1,
          },
        }}
        inputProps={{
          style: {
            color: theme.palette.text.primary,
          },
        }}
      />
    </Box>
  );
}
