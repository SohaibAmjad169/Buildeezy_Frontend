import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  FormHelperText,
  OutlinedInput,
  InputBase,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import MediaUpload from "./MediaUpload";
import DescriptionWithQuill from "./DescriptionWithQuill";
import BannerUpload from "./BannerUpload";
import BannerDisplay from "./BannerDisplay";
import SelectBox from "./SelectBox";
import UploadDoc from "../upload/UploadDoc";
import { useTheme } from "@mui/material/styles";
import { t } from "i18next";

function DesignField({ field, value, onChange, error, isLast }) {
  const theme = useTheme();

  const validateFieldValue = (value, validation) => {
    if (!validation) return "";

    if (validation.maxLength && value?.length > validation.maxLength) {
      return `Maximum ${validation.maxLength} characters allowed`;
    }

    if (
      validation.minItems &&
      Array.isArray(value) &&
      value.length < validation.minItems
    ) {
      return `Please select at least ${validation.minItems} item${
        validation.minItems > 1 ? "s" : ""
      }`;
    }

    if (
      validation.maxItems &&
      Array.isArray(value) &&
      value.length > validation.maxItems
    ) {
      return `Maximum ${validation.maxItems} items allowed`;
    }

    return "";
  };

  const renderListItems = (items = [], fields) => {
// Ensure at least one item exists
    const displayItems = items.length === 0 ? [{}] : items;

    return (
      <Box sx={{ width: "100%" }} data-tour={field.dataTour}>
        {displayItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              mb: 3,
              width: "100%",
            }}
          >
            {fields.map((subField) => {
              const fieldError = validateFieldValue(
                item[subField.id],
                subField.validation
              );

            // Render select for organization field
              if (subField.type === "select") {
                return (
                  <Box key={subField.id} sx={{ mb: 2, width: "100%" }}>
                    <FormControl fullWidth error={!!fieldError}>
                      <Select
                        value={item[subField.id] || ""}
                        onChange={(e) => {
                          const newItems = [...displayItems];
                          newItems[index] = {
                            ...newItems[index],
                            [subField.id]: e.target.value,
                          };
                          onChange?.(field.id, newItems);
                        }}
                        placeholder={subField.placeholder}
                        input={<OutlinedInput />}
                        displayEmpty
                        renderValue={(selected) =>
                          selected ? (
                            subField.options.find((opt) => opt.id === selected)
                              ?.label || selected?.label
                          ) : (
                            <span
                              style={{
                                color: theme.palette.text.secondary,
                                opacity: 1,
                              }}
                            >
                              {subField.placeholder}
                            </span>
                          )
                        }
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor:
                              theme.palette.mode === "dark"
                                ? theme.palette.divider
                                : theme.palette.grey[300],
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline":
                            theme.palette.mode === "dark"
                              ? { borderColor: "#fff" }
                              : {},
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                          },
                          backgroundColor: "transparent",
                          "& .MuiSelect-select": {
                            padding: "10px 14px",
                            fontSize: "0.875rem",
                            color: theme.palette.text.primary,
                            "&::placeholder": {
                              color: theme.palette.text.secondary,
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        {subField.options &&
                          subField.options.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.label}
                            </MenuItem>
                          ))}
                      </Select>
                      {fieldError && (
                        <FormHelperText>{fieldError}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                );
              }

              return (
                <Box key={subField.id} sx={{ mb: 2, width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", lg: "row" },
                      alignItems: "stretch",
                      border: `1px solid ${
                        theme.palette.mode === "dark"
                          ? theme.palette.divider
                          : theme.palette.grey[300]
                      }`,
                      borderRadius: "8px",
                      backgroundColor: "transparent",
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                      "&:hover":
                        theme.palette.mode === "dark"
                          ? { borderColor: "#fff", borderWidth: "1px" }
                          : {},
                      "&:focus-within":
                        theme.palette.mode === "dark"
                          ? { borderColor: "#fff", borderWidth: "1px" }
                          : {},
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: "100%", lg: "fit-content" },
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        borderRight: {
                          xs: "none",
                          lg: `1px solid ${
                            theme.palette.mode === "dark"
                              ? theme.palette.divider
                              : theme.palette.grey[300]
                          }`,
                        },
                        borderBottom: { xs: "1px solid #D0D5DD", lg: "none" },
                        minWidth: "fit-content",
                        whiteSpace: "nowrap",
                        color: theme.palette.text.primary,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        {subField.label}
                      </Typography>
                    </Box>
                    <InputBase
                      fullWidth
                      value={item[subField.id] || ""}
                      onChange={(e) => {
                        const newItems = [...displayItems];
                        newItems[index] = {
                          ...newItems[index],
                          [subField.id]: e.target.value,
                        };
                        onChange?.(field.id, newItems);
                      }}
                      placeholder={subField.placeholder}
                      sx={{
                        pl: 2,
                        pr: 2,
                        py: 0.5,
                        height: "42px",
                        flex: 1,
                        "& .MuiInputBase-input": {
                          fontSize: "0.875rem",
                          color: theme.palette.text.primary,
                          "&::placeholder": {
                            fontSize: "0.875rem",
                            opacity: 1,
                            color: theme.palette.text.secondary,
                          },
                        },
                      }}
                      inputProps={{
                        maxLength: subField.validation?.maxLength,
                      }}
                    />
                  </Box>
                  {fieldError && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#F04438",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {fieldError}
                    </Typography>
                  )}
      {/* Divider is handled by parent, so nothing here */}
                </Box>
              );
            })}
          </Box>
        ))}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 2,
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {displayItems.length > 1 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() =>
                onChange?.(
                  field.id,
                  displayItems.filter((_, i) => i !== displayItems.length - 1)
                )
              }
              sx={{
                color: "error.main",
                borderColor: "error.main",
                "&:hover": {
                  borderColor: "error.dark",
                  backgroundColor: "error.lighter",
                },
              }}
            >
              {t("common.remove")}
            </Button>
          )}
          {(!field.validation?.maxItems ||
            displayItems.length < field.validation.maxItems) && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                const newItem = {};
                fields.forEach((f) => {
                  newItem[f.id] = "";
                });
                onChange?.(field.id, [...displayItems, newItem]);
              }}
              sx={{
                color: "primary.main",
                borderColor: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "primary.lighter",
                },
              }}
            >
              {t("common.add_more")}
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  const renderField = () => {

    const getPlainTextLength = (html) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html || "";
      return tempDiv.textContent?.length || 0;
    };


    switch (field.type) {
      case "richText":
        return (
          <Box sx={{ width: "100%" }} data-tour={field.dataTour}>
            <DescriptionWithQuill
              value={value || field.defaultValue}
              onChange={(content) => onChange?.(field.id, content)}
              placeholder={field.placeholder}
              maxLength={field.validation?.maxLength || 300}
              error={error}
              sx={{
                "& .ql-toolbar": {
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  backgroundColor: "#fff",
                  border: "1px solid #D0D5DD",
                  borderBottom: "none",
                },
                "& .ql-container": {
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                  backgroundColor: "#fff",
                  border: "1px solid #D0D5DD",
                  borderTop: "none",
                  minHeight: "200px",
                },
                "& .ql-editor": {
                  minHeight: "200px",
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#101828",
                  "&::placeholder": {
                    color: "#667085",
                  },
                },
              }}
            />
            {field.validation?.maxLength && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "left",
                  mt: 0.5,
                  color: error ? "#F04438" : "#667085",
                }}
              >
                {field.validation.maxLength - getPlainTextLength(value)}{" "}
                {t("profile.characters_left")}
              </Typography>
            )}
          </Box>
        );

      case "select":
        return (
          <Box data-tour={field.dataTour}> {/* ✅ Added data-tour */}
            <SelectBox
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              options={field.options}
              onSelectChange={(id, val) => onChange?.(id, val)}
              validation={field.validation}
              disabled={field.disabled}
              error={error}
            />
          </Box>
        );

      case "multipleSelect":
        return (
          <FormControl fullWidth error={!!error} data-tour={field.dataTour}> {/* ✅ Added data-tour */}
            <SelectBox
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              options={field.options}
              onSelectChange={(id, val) => onChange?.(id, val)}
              validation={field.validation}
              multiple={true}
              disabled={field.disabled}
            />
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case "text":
        return (
          <Box sx={{ width: "100%" }} data-tour={field.dataTour}> {/* ✅ Added data-tour */}
            <TextField
              fullWidth
              multiline={field.multiline}
              rows={field.rows || 3}
              value={value || field.defaultValue}
              onChange={(e) => onChange?.(field.id, e.target.value)}
              placeholder={field.placeholder}
              error={!!error}
              helperText={error}
              variant="outlined"
              inputProps={{
                maxLength: field.validation?.maxLength,
              }}
              sx={{
                ...(field.multiline && {
                  "& .MuiOutlinedInput-root": {
                    height: 93,
                  },
                  "& .MuiInputBase-input": {
                    height: "auto !important",
                    paddingLeft: "14px !important",
                  },
                }),
              }}
            />
            {field.multiline && field.validation?.maxLength && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "left",
                  mt: 0.5,
                  color: "#667085",
                }}
              >
                {field.validation.maxLength - (value?.length || 0)}{" "}
                {t("profile.characters_left")}
              </Typography>
            )}
          </Box>
        );

      case "description":
        return (
          <Box sx={{ width: "100%" }} data-tour={field.dataTour}> {/* ✅ Added data-tour */}
            <TextField
              fullWidth
              multiline={field.multiline}
              rows={field.rows || 3}
              value={value || field.defaultValue}
              onChange={(e) => onChange?.(field.id, e.target.value)}
              placeholder={field.placeholder}
              error={!!error}
              helperText={error}
              variant="outlined"
              inputProps={{
                maxLength: field.validation?.maxLength,
              }}
              sx={{
                ...(field.multiline && {
                  "& .MuiOutlinedInput-root": {
                    height: 93,
                  },
                  "& .MuiInputBase-input": {
                    height: "auto !important",
                  },
                }),
              }}
            />
            {field.multiline && field.validation?.maxLength && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "left",
                  mt: 0.5,
                  color: "#667085",
                }}
              >
                {field.validation.maxLength - (value?.length || 0)}{" "}
                {t("profile.characters_left")}
              </Typography>
            )}
          </Box>
        );

      case "upload":
        return (
          <Box data-tour={field.dataTour}> {/* ✅ Added data-tour */}
            {field.id === "files" ? (
              <UploadDoc
                id={field.id}
                value={value}
                onSelectFiles={(id, files) => onChange?.(id, files)}
                acceptedFileTypes={field.validation?.acceptedFormats}
                multipleFiles={field.multipleFiles}
                showTitle={field.showTitle}
                isHorizontal={field.isHorizontal}
                isAssets={field.isAssets}
                isLogo={field.isLogo}
                mobileConfig={field.mobileConfig}
                validation={field.validation}
              />
            ) : field.type === "banner" ? (
              <BannerDisplay
                banner={value}
                onBannerChange={(newValue) => onChange?.(field.id, newValue)}
              />
            ) : (
              <BannerUpload
                id={field.id}
                value={value}
                onBannerChange={(newValue) => onChange?.(field.id, newValue)}
                acceptedFileTypes={field.validation?.acceptedFormats}
                validation={field.validation}
              />
            )}
            {error && (
              <FormHelperText error sx={{ mt: 1 }}>
                {error}
              </FormHelperText>
            )}
          </Box>
        );

      case "banner":
        return (
          <Box data-tour={field.dataTour}> {/* ✅ Added data-tour */}
            {field.id === "thumbnail" || field.type === "banner" ? (
              <>
                <MediaUpload
                  type="banner"
                  value={value}
                  onChange={(data) => onChange?.(field.id, data)}
                  aspectRatio={2}
                  maxSize={5}
                />
                {error && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {error}
                  </FormHelperText>
                )}
              </>
            ) : null}
          </Box>
        );

      case "video":
        return (
          <Box sx={{ width: "100%" }} data-tour={field.dataTour}> {/* ✅ Added data-tour */}
            {value ? (
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  borderRadius: "8px",
                  overflow: "hidden",
                  mb: 2,
                  border: `1px solid ${
                    theme.palette.mode === "dark"
                      ? theme.palette.divider
                      : theme.palette.grey[300]
                  }`,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                }}
              >
                <video
                  src={value}
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <Button
                  onClick={() => onChange?.(field.id, null)}
                  startIcon={<DeleteIcon />}
                  variant="text"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#fff",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                    },
                  }}
                >
                  {t("common.remove")}
                </Button>
              </Box>
            ) : (
              <Box
                onClick={() =>
                  document
                    .getElementById(`video-upload-input-${field.id}`)
                    .click()
                }
                sx={{
                  border: `1px solid ${
                    theme.palette.mode === "dark"
                      ? theme.palette.divider
                      : theme.palette.grey[300]
                  }`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  p: 2,
                  bgcolor: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  width: "100%",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                  "&:hover":
                    theme.palette.mode === "dark"
                      ? { borderColor: "#fff", borderWidth: "1px" }
                      : {},
                }}
              >
                <input
                  id={`video-upload-input-${field.id}`}
                  type="file"
                  accept="video/mp4"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith("video/")) {
                      if (file.size > 20 * 1024 * 1024) {
                        alert("Video is too large (max 20MB)");
                        return;
                      }
                      const videoUrl = URL.createObjectURL(file);
                      onChange?.(field.id, videoUrl, file);
                    }
                  }}
                  style={{ display: "none" }}
                />
                <CloudUploadIcon
                  sx={{ fontSize: 40, color: "#b0b0b0", mb: 2 }}
                />
                <Typography
                  sx={{
                    color: "#b0b0b0",
                    fontSize: "0.875rem",
                    textAlign: "center",
                  }}
                >
                  Click to upload or drag and drop
                  <br />
                  Max size: 20MB (MP4)
                </Typography>
              </Box>
            )}
            {error && (
              <FormHelperText error sx={{ mt: 1 }}>
                {error}
              </FormHelperText>
            )}
          </Box>
        );

      case "files":
        return (
          <Box data-tour={field.dataTour}> {/* ✅ Added data-tour */}
            <MediaUpload
              type="files"
              value={value}
              onChange={(data) => onChange?.(field.id, data)}
              maxSize={20}
            />
            {error && (
              <FormHelperText error sx={{ mt: 1 }}>
                {error}
              </FormHelperText>
            )}
          </Box>
        );

      case "list":
        return (
          <>
            {/* Mobile version (below 1200px) */}
            <Box sx={{ display: { xs: "block", lg: "none" }, width: "100%" }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color:
                      theme.palette.mode === "dark" ? "#E4E7EC" : "#101828",
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: "24px",
                  }}
                >
                  {field.translationKey}
                </Typography>
                {field.subtitle && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#667085",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      mt: 0.5,
                    }}
                  >
                    {field.subtitle}
                  </Typography>
                )}
              </Box>
              <Box sx={{ width: "100%" }}>
                {renderListItems(value || [], field.fields)}
              </Box>
            </Box>
            {/* Desktop version (1200px and above) */}
            <Box sx={{ display: { xs: "none", lg: "block" }, width: "100%" }}>
              {renderListItems(value || [], field.fields)}
            </Box>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          py: 3,
          gap: 2,
          flexDirection: { xs: "column", lg: "row" },
        }}
        data-tour={field.dataTour} // ✅ Also add to the main container as fallback
      >
        {/* Title section */}
        <Box
          sx={{
            display: field.id === "faq" ? { xs: "none", lg: "flex" } : "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            mb: { xs: 2, lg: 0 },
            width: { xs: "100%", lg: "50%" },
          }}
        >
          <Typography variant="h5">{field.translationKey}</Typography>
          {field.subtitle && (
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", fontSize: "0.7rem", mt: 0.5 }}
            >
              {field.subtitle}
            </Typography>
          )}
        </Box>
        
        {/* Content section */}
        <Box
          sx={{
            width:
              field.id === "faq"
                ? { xs: "100%", lg: "50%" }
                : { xs: "100%", lg: "50%" },
          }}
        >
          {field.type === "list" ? (
            <>
              {/* Mobile version (below 1200px) */}
              <Box sx={{ display: { xs: "block", lg: "none" }, width: "100%" }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color:
                        theme.palette.mode === "dark" ? "#E4E7EC" : "#101828",
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "24px",
                    }}
                  >
                    {field.translationKey}
                  </Typography>
                  {field.subtitle && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#667085",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        mt: 0.5,
                      }}
                    >
                      {field.subtitle}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ width: "100%" }}>
                  {renderListItems(value || [], field.fields)}
                </Box>
              </Box>
              {/* Desktop version (1200px and above) */}
              <Box sx={{ display: { xs: "none", lg: "block" }, width: "100%" }}>
                {renderListItems(value || [], field.fields)}
              </Box>
            </>
          ) : (
            renderField()
          )}
          {error && (
            <Typography
              variant="caption"
              sx={{
                color: "#F04438",
                mt: 1,
                display: "block",
              }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </Box>
      {!isLast && <Divider sx={{ borderColor: theme.palette.divider }} />}
    </>
  );
}

export default DesignField;