import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import MuiTypography from "../common/MuiTypography";
import { DoubleSideInput } from "../common/DoubleSideInput";
import { FIELD_TYPES } from "../../utils/constants/login";
import { t } from "i18next";

const EMPTY_COMPANY_DETAIL = {
  website: "",
  address: "",
  email: "",
};

const INPUT_FIELDS = [
  {
    id: "website",
    label: t("profile.website"),
    placeholder: "yourcompany.com",
    type: FIELD_TYPES.text,
  },
  {
    id: "address",
    label: t("profile.address"),
    placeholder: "Your Company Address",
    type: FIELD_TYPES.text,
  },
  {
    id: "email",
    label: t("profile.company_email"),
    placeholder: "name@yourcompany.com",
    type: FIELD_TYPES.text,
  },
];

function CompanyDetailType({
  id: questionId,
  label,
  onValueChange,
  value,
  isProfile,
  disabled = false,
}) {
  const [companyDetails, setCompanyDetails] = useState(() => {
    if (!value) return [{ ...EMPTY_COMPANY_DETAIL }];

    // Handle old format
    if (value.additionalProp1) {
      const { website, address, email } = value.additionalProp1;
      return [{ website, address, email }];
    }

    // Handle array format but ensure only necessary fields
    if (Array.isArray(value)) {
      const detail = value[0] || {};
      return [
        {
          website: detail.website || "",
          address: detail.address || "",
          email: detail.email || "",
        },
      ];
    }

    return [{ ...EMPTY_COMPANY_DETAIL }];
  });

  useEffect(() => {
    if (!value) return;

    if (value.additionalProp1) {
      const { website, address, email } = value.additionalProp1;
      setCompanyDetails([{ website, address, email }]);
    } else if (Array.isArray(value)) {
      const detail = value[0] || {};
      const cleanedDetail = {
        website: detail.website || "",
        address: detail.address || "",
        email: detail.email || "",
      };
      setCompanyDetails([cleanedDetail]);
    }
  }, [value]);

  function handleDataChange(index, fieldId, fieldValue) {
    const newCompanyDetails = [...companyDetails];
    if (!newCompanyDetails[index]) {
      newCompanyDetails[index] = { ...EMPTY_COMPANY_DETAIL };
    }
    newCompanyDetails[index] = {
      ...newCompanyDetails[index],
      [fieldId]: fieldValue || "", // Ensure empty string instead of undefined
    };
    setCompanyDetails(newCompanyDetails);
    onValueChange(questionId, newCompanyDetails);
  }

  return (
    <>
      {!isProfile && (
        <MuiTypography variant="body2" sx={{ color: "black" }}>
          {label}
        </MuiTypography>
      )}

      {companyDetails.map((detail, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            flexDirection: "column",
            mt: isProfile ? 0 : 2,
            width: "100%",
            gap: 2,
          }}
        >
          {INPUT_FIELDS.map((field) => (
            <Box key={field.id} sx={{ width: "100%" }}>
              <DoubleSideInput
                label={field.label}
                value={detail[field.id] || ""}
                onChange={(value) => handleDataChange(index, field.id, value)}
                type={field.type}
                placeholder={field.placeholder}
                disabled={disabled}
              />
            </Box>
          ))}
        </Box>
      ))}
    </>
  );
}

export default CompanyDetailType;
