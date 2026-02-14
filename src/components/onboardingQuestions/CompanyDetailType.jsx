import { Box } from "@mui/material";
// import { FIELD_TYPES } from "../../utils/constants/login";
import { DoubleSideInput } from "../common/DoubleSideInput";
import { t } from "i18next";

const DOUBLE_FIELDS = [
  {
    id: "website",
    label: t("profile.website"),
    placeholder: ["Website URL 1", "Website URL 2"],
  },
  {
    id: "address",
    label: t("profile.address"),
    placeholder: ["Address Line 1", "Address Line 2"],
  },
  {
    id: "email",
    label: t("profile.company_email"),
    placeholder: ["Email 1", "Email 2"],
  },
];

function CompanyDetailType({ value, onValueChange, disabled = false }) {

  function handleDataChange(fieldId, fieldValue) {
    onValueChange({
      ...value,
      [fieldId]: fieldValue,
    });
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: 2,
      }}
    >
      {DOUBLE_FIELDS?.map((field) => (
        <Box key={field.id} sx={{ width: "100%" }}>
          <DoubleSideInput
            label={field.label}
            firstValue={(value?.[field.id] || "")}
            onFirstChange={(val) => handleDataChange(field.id, val)}
            firstPlaceholder={field.placeholder[0]}
            disabled={disabled}
          />
        </Box>
      ))}
    </Box>
  );
}

export default CompanyDetailType;
