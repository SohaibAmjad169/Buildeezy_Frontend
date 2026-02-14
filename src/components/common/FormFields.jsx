import { useMemo, useState, useEffect } from "react";
import { FIELD_TYPES } from "../../utils/constants/login";
import AutocompleteBox from "./AutocompleteBox";
import ContactBox from "./ContactBox";
import InputBox from "./InputBox";
import SelectBox from "./SelectBox";
import UploadDoc from "../upload/UploadDoc";
import AddressFields from "../postAJob/AddressFields";
import RadioBox from "./RadioBox";
import DateBox from "./DateBox";
import RatingBox from "./RatingBox";
import CountryCityBox from "./CountryCityBox";
import DoubleInputBox from "./DoubleInputBox";
import DescriptionWithQuill from "./DescriptionWithQuill";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  InputBase,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import BannerUpload from "../profile/design/BannerUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import UserAutocompleteBox from "./UserAutocompleteBox";
import { useTranslation } from "react-i18next";
import { colors } from "@mui/material";

function FormFields({
  id,
  placeholder,
  value,
  options,
  onValueChange,
  onInputChange,
  type,
  validation,
  initLoad,
  disabled = false,
  multipleFiles = false,
  fileTypes,
  showTitle = true,
  dateType,
  isAssets = false,
  isLogo = false,
  mobileConfig = {},
  fields = [],
  title,
  subtitle,
  fieldType, // ← Added fieldType as a separate prop
  shouldUploadVerifyExplicit = false, // apply for Upload Doc only
}) {
  const { t } = useTranslation();
  const [listItems, setListItems] = useState([]);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  // ✅ Use fieldType if type is undefined, otherwise use type
  const actualType = type || fieldType;
  
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (actualType === FIELD_TYPES.list && value) {
      setListItems(value);
    }
  }, [value, actualType]);

  const handleListItemChange = (itemId, fieldId, fieldValue) => {
    const updatedItems = listItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          [fieldId]: fieldValue,
        };
      }
      return item;
    });
    setListItems(updatedItems);
    onValueChange?.(id, updatedItems);
  };

  const handleAddListItem = () => {
    const maxId = listItems.reduce((max, item) => {
      return typeof item.id === "number" && item.id > max ? item.id : max;
    }, 0);

    const newItem = {
      id: maxId + 1,
      displayOrder: listItems.length + 1,
    };

    fields.forEach((field) => {
      newItem[field.id] = "";
    });

    const updatedItems = [...listItems, newItem];
    setListItems(updatedItems);
    onValueChange?.(id, updatedItems);
  };

  const handleRemoveListItem = (itemId) => {
    const updatedItems = listItems.filter((item) => item.id !== itemId);
    setListItems(updatedItems);
    onValueChange?.(id, updatedItems);
  };

  const renderListItems = () => {
    const displayItems = listItems.length === 0 ? [{}] : listItems;

    return (
      <Box sx={{ width: "100%" }}>
        {displayItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              mb: 3,
              width: "100%",
            }}
          >
            {fields.map((subField) => (
              <Box
                key={subField.id}
                sx={{
                  mb: 2,
                  width: "100%",
                  "&:last-child": { mb: 0 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", lg: "row" },
                    alignItems: "stretch",
                    border: "1px solid #D0D5DD",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    overflow: "hidden",
                    "&:hover": {
                      borderColor: "#D0D5DD",
                    },
                    "&:focus-within": {
                      borderWidth: "2px",
                      borderColor: "#D0D5DD",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: "100%", lg: "fit-content" },
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      borderRight: { xs: "none", lg: "1px solid #D0D5DD" },
                      borderBottom: { xs: "1px solid #D0D5DD", lg: "none" },
                      minWidth: "fit-content",
                      whiteSpace: "nowrap",
                      background: isDark
                        ? theme.palette.background.paper
                        : undefined,
                      color: isDark ? "#fff" : undefined,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: isDark ? "#fff" : "#000" }}
                    >
                      {subField.title}
                    </Typography>
                  </Box>
                  <InputBase
                    fullWidth
                    value={item[subField.id] || ""}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const parsedValue =
                        subField.type === "number"
                          ? Number(rawValue)
                          : rawValue;
                      handleListItemChange(item.id, subField.id, parsedValue);
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
                        color: isDark ? "#fff" : "#000",
                        "&::placeholder": {
                          fontSize: "0.875rem",
                          opacity: 0.5,
                          color: "#667085",
                        },
                      },
                      background: isDark
                        ? theme.palette.background.paper
                        : undefined,
                      color: isDark ? "#fff" : undefined,
                    }}
                    inputProps={{
                      maxLength: subField.validation?.maxLength,
                    }}
                  />
                </Box>
                {validation?.error && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#F04438",
                      mt: 0.5,
                      display: "block",
                    }}
                  >
                    {validation.error}
                  </Typography>
                )}
              </Box>
            ))}
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
                handleRemoveListItem(displayItems[displayItems.length - 1].id)
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
          {(!validation?.maxItems ||
            displayItems.length < validation.maxItems) && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddListItem}
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

  const renderField = useMemo(() => {
    const translatedPlaceholder =
      id === "professionalType"
        ? placeholder
        : placeholder
        ? t(placeholder)
        : "";

    const renderFieldContent = () => {
      switch (actualType) {
        case FIELD_TYPES.text:
        case FIELD_TYPES.password:
        case FIELD_TYPES.description:
          return (
            <InputBox
              id={id}
              placeholder={translatedPlaceholder}
              value={value}
              onInputChange={onValueChange}
              type={actualType}
              validation={validation}
              initLoad={initLoad}
              disabled={disabled}
            />
          );
        case FIELD_TYPES.list:
          return renderListItems();
        case FIELD_TYPES.quillEditor:
          return (
            <Box sx={{ width: "100%" }}>
              <DescriptionWithQuill
                value={value || ""}
                onChange={(content) => onValueChange?.(id, content)}
                placeholder={t(placeholder)}
                maxLength={validation?.maxLength}
                onCharCountChange={(count) => setCharCount(count)}
                error={validation?.error}
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
                    textAlign: "left",
                    "&::placeholder": {
                      color: "#667085",
                      textAlign: "left",
                    },
                  },
                }}
              />

              {validation?.maxLength && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "left",
                    mt: 0.5,
                    color: validation?.error ? "#F04438" : "#667085",
                  }}
                >
                  {validation.maxLength - charCount} {t("common.helper")}
                </Typography>
              )}
            </Box>
          );
        case FIELD_TYPES.select:
        case FIELD_TYPES.multipleSelect:
          return (
            <SelectBox
              id={id}
              placeholder={translatedPlaceholder}
              value={value}
              options={options}
              onSelectChange={onValueChange}
              validation={validation}
              initLoad={initLoad}
              multiple={actualType === FIELD_TYPES.multipleSelect}
              disabled={disabled}
            />
          );
        case FIELD_TYPES.userAutocomplete:
          return (
            <UserAutocompleteBox
              id={id}
              placeholder={placeholder}
              value={value}
              options={options}
              onSelectChange={onValueChange}
              onInputChange={onInputChange}
              validation={validation}
              initLoad={initLoad}
              disabled={disabled}
            />
          );
        case FIELD_TYPES.autoComplete:
          return (
            <AutocompleteBox
              id={id}
              placeholder={translatedPlaceholder}
              value={value}
              options={options}
              onSelectChange={onValueChange}
              onInputChange={onInputChange}
              validation={validation}
              initLoad={initLoad}
              disabled={disabled}
            />
          );
        case FIELD_TYPES.contact:
          return (
            <ContactBox
              id={id}
              placeholder={placeholder}
              value={value}
              onInputChange={onValueChange}
              validation={validation}
              initLoad={initLoad}
              disabled={disabled}
            />
          );
        case FIELD_TYPES.upload:
          // if (id === "banner") {
          //   return (
          //     <Box sx={{ width: "100%" }}>
          //       <BannerUpload
          //         type="banner"
          //         value={value || ""}
          //         onChange={(data) => onValueChange?.(id, data)}
          //         aspectRatio={2}
          //         maxSize={5}
          //         validation={validation}
          //         mobileConfig={mobileConfig}
          //         disabled={disabled}
          //       />
          //       {validation?.error && (
          //         <Typography
          //           variant="caption"
          //           sx={{
          //             color: "error.main",
          //             mt: 1,
          //             display: "block",
          //           }}
          //         >
          //           {validation.error}
          //         </Typography>
          //       )}
          //     </Box>
          //   );
          // }
          return (
            <UploadDoc
              id={id}
              label={placeholder}
              value={value || ""}
              onSelectFiles={onValueChange}
              multipleFiles={multipleFiles}
              acceptedFileTypes={fileTypes}
              showTitle={showTitle}
              validation={validation}
              isDisabled={disabled}
              isAssets={isAssets}
              isLogo={isLogo}
              mobileConfig={mobileConfig}
              shouldVerify={shouldUploadVerifyExplicit}
            />
          );
        case FIELD_TYPES.address:
          return (
            <AddressFields
              id={id}
              placeholder={t(placeholder)}
              value={value}
              onInputChange={onValueChange}
              disabled={disabled}
            />
          );
        case FIELD_TYPES.radio:
          return (
            <RadioBox
              id={id}
              value={value}
              options={options}
              onSelectChange={onValueChange}
              validation={validation}
              initLoad={initLoad}
              disabled={disabled}
            />
          );
        case FIELD_TYPES.dates:
          return (
            <DateBox
              id={id}
              value={value}
              onSelectChange={onValueChange}
              validation={validation}
              initLoad={initLoad}
              disabled={disabled}
              type={dateType}
            />
          );
        case FIELD_TYPES.rating:
          return (
            <RatingBox
              id={id}
              value={value}
              onSelectChange={onValueChange}
              validation={validation}
              initLoad={initLoad}
              disabled={disabled}
            />
          );
        case FIELD_TYPES.countryCity:
          return (
            <CountryCityBox
              id={id}
              placeholder={placeholder}
              value={value}
              onInputChange={onValueChange}
              validation={validation}
              initLoad={initLoad}
              disabled={disabled}
            />
          );
        case FIELD_TYPES.doubleInput:
          return (
            <DoubleInputBox
              id={id}
              placeholder={placeholder}
              value={value}
              onInputChange={onValueChange}
              validation={validation}
              initLoad={initLoad}
              disabled={disabled}
            />
          );
        default:
          return null;
      }
    };

    return (
      <Box sx={{ width: "100%" }}>
        {title && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#101828",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "24px",
              }}
            >
              {title}
            </Typography>
            {subtitle && (
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
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        {renderFieldContent()}
      </Box>
    );
  }, [
    id,
    placeholder,
    value,
    options,
    onValueChange,
    onInputChange,
    actualType, // ← Updated dependency
    validation,
    initLoad,
    disabled,
    multipleFiles,
    fileTypes,
    showTitle,
    dateType,
    isAssets,
    isLogo,
    mobileConfig,
    fields,
    listItems,
    title,
    subtitle,
    isMobile,
    renderListItems,
    charCount, // ← Added charCount dependency
  ]);

  return renderField;
}

FormFields.propTypes = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  options: PropTypes.array,
  onValueChange: PropTypes.func,
  onInputChange: PropTypes.func,
  type: PropTypes.string,
  validation: PropTypes.object,
  initLoad: PropTypes.bool,
  disabled: PropTypes.bool,
  multipleFiles: PropTypes.bool,
  fileTypes: PropTypes.object,
  showTitle: PropTypes.bool,
  dateType: PropTypes.string,
  isAssets: PropTypes.bool,
  isLogo: PropTypes.bool,
  mobileConfig: PropTypes.object,
  fields: PropTypes.array,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  fieldType: PropTypes.string, // ← Added fieldType to PropTypes
  shouldUploadVerifyExplicit: PropTypes.bool, // apply for Upload Doc only
};

export default FormFields;