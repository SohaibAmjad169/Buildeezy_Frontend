import { Box, useTheme } from "@mui/material";
import ProfessionalAffiliation from "./ProfessionalAffiliation";
import React from "react";

const AFFILIATION = {
  title: "",
  memberSince: "",
  licenceNumber: "",
  description: "",
  validation: {},
};

function ProfessionalAffiliationsContainer({
  value = [],
  onChange,
  disabled = false,
}) {
  const theme = useTheme();

  const handleDataChange = (index, fieldId, newValue) => {
    const newAffiliations = [...value];
    if (!newAffiliations[index]) {
      newAffiliations[index] = { ...AFFILIATION };
    }
    newAffiliations[index][fieldId] = newValue;
    onChange(newAffiliations);
  };

  const handleAdd = () => {
    onChange([...value, { ...AFFILIATION }]);
  };

  const handleRemove = (index) => {
    const newAffiliations = value.filter((_, i) => i !== index);
    onChange(newAffiliations);
  };

  // Ensure we always have at least one affiliation
  const affiliations = value.length > 0 ? value : [{ ...AFFILIATION }];

  return (
    <Box sx={{ width: "100%" }}>
      {affiliations.map((affiliation, index) => (
        <React.Fragment key={index}>
          <Box
            sx={{
              mb: 0,
              pb: 0,
            }}
          >
            <ProfessionalAffiliation
              index={index}
              data={affiliation}
              handleDataChange={handleDataChange}
              onAdd={index === affiliations.length - 1 ? handleAdd : undefined}
              onRemove={
                affiliations.length > 1 ? () => handleRemove(index) : undefined
              }
              isLast={index === affiliations.length - 1}
              disabled={disabled}
            />
          </Box>
          {index < affiliations.length - 1 && (
            <Box sx={{ width: "100%", my: 4 }}>
              <Box
                sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
              />
            </Box>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
}

export default ProfessionalAffiliationsContainer;
