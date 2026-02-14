import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Select, MenuItem, Checkbox } from "@mui/material";
import { useTranslation } from "react-i18next";

import MuiTypography from "./MuiTypography";
import { isEmpty } from "lodash";
import { useThemeMode } from "../../context/ThemeContext";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: "250",
    },
  },
};

function SelectBox({
  id,
  placeholder,
  options = [],
  onSelectChange,
  value: selectedValue = "",
  multiple,
  validation = {},
  initLoad,
  disabled,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { mode } = useThemeMode();
  const { loading } = useSelector((state) => state.config);

  const [error, setError] = useState("");

  useEffect(() => {
    setError(validation?.error);
  }, [validation?.error]);

  const isAllSelected =
    multiple && Array.isArray(selectedValue)
      ? selectedValue.length === options.length
      : false;

  const handleChange = (event) => {
    let validationError = "";
    const { name, value } = event.target;

    if (!isEmpty(validation) && !initLoad) {
      if (validation.rules) {
        validationError = validation.rules(
          value,
          "msg" in validation && validation.msg
        );
      }
      if (validationError === "" && validation.required) {
        validationError =
          value && (Array.isArray(value) ? value.length > 0 : true)
            ? ""
            : "invalid";
      }
    }

    if (multiple) {
      if (value[value.length - 1] === "all") {
        const newValue =
          Array.isArray(selectedValue) &&
            selectedValue.length === options.length
            ? []
            : options.map((option) => option.id);

        onSelectChange(name, newValue, validationError);
        // close the select box when selected all
        setOpen(false);
        return;
      }

      // Filter out any duplicate values
      const uniqueValues = [...new Set(value)];
      onSelectChange(name, uniqueValues, validationError);
    } else {
      onSelectChange(name, value, validationError);
    }
  };

  return (
    <Box className="select-field">
      <Select
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        disabled={loading || disabled}
        multiple={multiple}
        displayEmpty
        size="small"
        id={id}
        name={id}
        value={selectedValue || (multiple ? [] : "")}
        onChange={handleChange}
        MenuProps={MenuProps}
        renderValue={(selected) => {
          if (!selected || (Array.isArray(selected) && selected.length === 0)) {
            return (
              <Box
                sx={{
                  color: mode === "dark" ? "common.white" : "placeholderColor",
                }}
              >
                {placeholder}
              </Box>
            );
          }
          if (multiple && Array.isArray(selected)) {
            const selectedLabel = options.filter((item) =>
              selected.find((selectedItem) => selectedItem === item.id)
            );
            return selectedLabel.map((item) => item.label).join(", ");
          }
          const selectedLabel = options.find((item) => item.id === selected);
          return selectedLabel?.label || placeholder;
        }}
      >
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
        {multiple && (
          <MenuItem style={{ padding: multiple && 0 }} key={id} value="all">
            <Checkbox
              checked={isAllSelected}
              size="small"
              indeterminate={
                selectedValue.length > 0 &&
                selectedValue.length < options.length
              }
            />
            {t("all")}
          </MenuItem>
        )}

        {options.map(({ id, label }) => (
          <MenuItem style={{ padding: multiple && 0 }} key={id} value={id}>
            {multiple && (
              <Checkbox checked={selectedValue.indexOf(id) > -1} size="small" />
            )}
            {label}
          </MenuItem>
        ))}
      </Select>
      {!initLoad && error && (
        <MuiTypography variant="errorText">{error}</MuiTypography>
      )}
    </Box>
  );
}

export default SelectBox;
