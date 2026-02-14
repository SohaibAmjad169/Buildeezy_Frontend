import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function CustomSwitch({ checked, onClick }) {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 40,
        height: 24,
        borderRadius: 12,
        backgroundColor: checked ? theme.palette.primary.main : "#bfc9cf",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        display: "inline-block",
        verticalAlign: "middle",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: checked ? "#fff" : "#f5f7fa",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          transition: "left 0.2s, background 0.2s",
        }}
      />
    </Box>
  );
}

function SwitchOption({ value, options, onChange }) {
  const theme = useTheme();
  const isMulti = Array.isArray(value);
  const handleToggle = (optValue) => {
    if (isMulti) {
      if (value.includes(optValue)) {
        onChange(value.filter((v) => v !== optValue));
      } else {
        onChange([...value, optValue]);
      }
    } else {
      onChange(optValue);
    }
  };
  return (
    <Box>
      {options.map((opt) => (
        <Box
          key={opt.value}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
            cursor: "pointer",
          }}
          onClick={() => handleToggle(opt.value)}
        >
          <CustomSwitch
            checked={isMulti ? value.includes(opt.value) : value === opt.value}
          />
          <Box
            sx={{
              ml: 2,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: theme.palette.text.secondary,
            }}
          >
            {opt.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export { CustomSwitch };
export default SwitchOption;
