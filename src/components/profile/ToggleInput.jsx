import { useState } from "react";
import { Box, Button } from "@mui/material";

function ToggleInput({ id, options, value, onValueChange }) {
  const [selected, setSelected] = useState(value);

  const handleSelect = (optionId) => {
    setSelected(optionId);
    onValueChange(id, optionId, "");
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {options.map((option) => (
        <Button
          key={option.id}
          onClick={() => handleSelect(option.id)}
          sx={{
            backgroundColor: selected === option.id ? "#48752C" : "#F5F5F5",
            color: selected === option.id ? "#FFFFFF" : "#000000",
            borderRadius: "20px",
            padding: "8px 20px",
            fontWeight: "bold",
            border: "1px solid #48752C",
            "&:hover": {
              backgroundColor: selected === option.id ? "#3A5C24" : "#E0E0E0",
            },
          }}
        >
          {option.label}
        </Button>
      ))}
    </Box>
  );
}

export default ToggleInput;
