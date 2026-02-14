import { Box, TextField, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FIELD_TYPES } from "../../utils/constants/login";

function FormField({ field, value, onChange }) {
  const { t } = useTranslation();

  const handleChange = (event) => {
    let newValue = event.target.value;
    let error = "";

    // Validate required field
    if (field.validation.required && !newValue) {
      error = t("validation.required");
    }

    // Validate max length
    if (
      field.validation.maxLength &&
      newValue.length > field.validation.maxLength
    ) {
      error = t("validation.max_length", { max: field.validation.maxLength });
    }

    // Validate pattern if exists
    if (
      field.validation.pattern &&
      !new RegExp(field.validation.pattern).test(newValue)
    ) {
      error = t("validation.invalid_format");
    }

    // Validate min items for multiple select
    if (
      field.type === FIELD_TYPES.multipleSelect &&
      field.validation.minItems
    ) {
      if (
        !Array.isArray(newValue) ||
        newValue.length < field.validation.minItems
      ) {
        error = t("validation.min_items", { min: field.validation.minItems });
      }
    }

    // Validate max items for multiple select
    if (
      field.type === FIELD_TYPES.multipleSelect &&
      field.validation.maxItems
    ) {
      if (
        Array.isArray(newValue) &&
        newValue.length > field.validation.maxItems
      ) {
        error = t("validation.max_items", { max: field.validation.maxItems });
      }
    }

    onChange(field.id, newValue, error);
  };

  const renderField = () => {
    switch (field.type) {
      case FIELD_TYPES.select:
        return (
          <TextField
            select
            fullWidth
            value={value || ""}
            onChange={handleChange}
            error={!!field.validation.error}
            helperText={field.validation.error}
            label={t(field.translationKey)}
            placeholder={t(field.placeholder)}
          >
            {field.options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case FIELD_TYPES.textarea:
        return (
          <TextField
            multiline
            rows={4}
            fullWidth
            value={value || ""}
            onChange={handleChange}
            error={!!field.validation.error}
            helperText={field.validation.error}
            label={t(field.translationKey)}
            placeholder={t(field.placeholder)}
          />
        );

      case FIELD_TYPES.date:
        return (
          <TextField
            type="date"
            fullWidth
            value={value || ""}
            onChange={handleChange}
            error={!!field.validation.error}
            helperText={field.validation.error}
            label={t(field.translationKey)}
            InputLabelProps={{ shrink: true }}
          />
        );

      case FIELD_TYPES.upload:
        return (
          <Box>
            <TextField
              type="file"
              fullWidth
              inputProps={{
                multiple: field.validation.maxItems > 1,
                accept: field.acceptedFormats.join(","),
              }}
              onChange={(event) => {
                const files = Array.from(event.target.files);
                let error = "";

                // Validate file size
                if (field.validation.maxSize) {
                  const [maxWidth, maxHeight] = field.validation.maxSize
                    .split("x")
                    .map(Number);
                  for (const file of files) {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    if (img.width > maxWidth || img.height > maxHeight) {
                      error = t("validation.image_size", {
                        maxWidth,
                        maxHeight,
                      });
                      break;
                    }
                  }
                }

                // Validate number of files
                if (
                  field.validation.minItems &&
                  files.length < field.validation.minItems
                ) {
                  error = t("validation.min_files", {
                    min: field.validation.minItems,
                  });
                }
                if (
                  field.validation.maxItems &&
                  files.length > field.validation.maxItems
                ) {
                  error = t("validation.max_files", {
                    max: field.validation.maxItems,
                  });
                }

                onChange(field.id, files, error);
              }}
              error={!!field.validation.error}
              helperText={field.validation.error}
              label={t(field.translationKey)}
            />
            {value && value.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {value.map((file, index) => (
                  <Box key={index} component="span" sx={{ mr: 1 }}>
                    {file.name}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            value={value || ""}
            onChange={handleChange}
            error={!!field.validation.error}
            helperText={field.validation.error}
            label={t(field.translationKey)}
            placeholder={t(field.placeholder)}
          />
        );
    }
  };

  return <Box sx={{ mb: 2 }}>{renderField()}</Box>;
}

export default FormField;
