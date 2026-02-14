import {
  FormControl,
  Select as MuiSelect,
  MenuItem,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";

const Select = ({ label, value, onChange, placeholder, options }) => {
  return (
    <FormControl fullWidth size="small">
      <Typography variant="caption" color="text.secondary" mb={0.5}>
        {label}
      </Typography>
      <MuiSelect
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        sx={{
          "& .MuiSelect-select": {
            py: 1,
            fontSize: "0.875rem",
          },
        }}
      >
        <MenuItem value="">
          <Typography variant="body2" color="text.secondary">
            {placeholder}
          </Typography>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Typography variant="body2">{option.label}</Typography>
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

Select.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Select;
