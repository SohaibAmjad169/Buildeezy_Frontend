import { Box, Select, MenuItem } from "@mui/material";
import { THEME_OPTIONS } from "./DesignTab.constants";
import { styled } from "@mui/material/styles";

const StyledSelect = styled(Select)(({ theme }) => ({
  width: "100%",
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor:
      theme.palette.mode === "dark"
        ? theme.palette.divider
        : theme.palette.grey[300],
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor:
      theme.palette.mode === "dark" ? "#fff" : theme.palette.grey[400],
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}));

const ThemePreviewCircle = ({ color, previewImage }) => (
  <Box
    sx={{
      width: 24,
      height: 24,
      borderRadius: "50%",
      backgroundColor: previewImage ? "transparent" : color,
      backgroundImage: previewImage ? `url(${previewImage})` : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      border: "1px solid #E0E0E0",
      flexShrink: 0,
    }}
  />
);

const ThemeSelect = ({ value, onChange }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  const selectedTheme = THEME_OPTIONS.find((theme) => theme.id === value);

  return (
    <StyledSelect
      value={value}
      onChange={handleChange}
      displayEmpty
      renderValue={() => (
        <>
          <ThemePreviewCircle
            color={selectedTheme?.color}
            previewImage={selectedTheme?.previewImage}
          />
          {selectedTheme?.label}
        </>
      )}
    >
      {THEME_OPTIONS.map((theme) => (
        <MenuItem
          key={theme.id}
          value={theme.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ThemePreviewCircle
            color={theme.color}
            previewImage={theme.previewImage}
          />
          {theme.label}
        </MenuItem>
      ))}
    </StyledSelect>
  );
};

export default ThemeSelect;
