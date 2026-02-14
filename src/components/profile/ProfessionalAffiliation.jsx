import { Box, Button } from "@mui/material";
import { FIELD_TYPES } from "../../utils/constants/login";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import SelectBox from "../common/SelectBox";
import InputBox from "../common/InputBox";
import { DoubleSideInput } from "../common/DoubleSideInput";
import { t } from "i18next";

function ProfessionalAffiliation({
  index,
  handleDataChange,
  onAdd,
  onRemove,
  isLast,
  data = {
    title: "",
    memberSince: "",
    licenceNumber: "",
    description: "",
    validation: {},
  },
  disabled = false,
}) {

  const LICENSE_OPTIONS = [
    { id: "real_estate", label: t("profile.real_estate_license") },
    { id: "contractor", label: t("profile.contractor_license") },
    { id: "architect", label: t("profile.architect_icense") },
    { id: "engineer", label: t("profile.engineering_license") },
    { id: "other", label: t("profile.other_professional_license") },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      ></Box>

      <Box sx={{ mb: 3 }}>
        <DoubleSideInput
          id={`title_${index}`}
          label={t("profile.profile_title")}
          firstPlaceholder={t("profile.profile_member")}
          firstValue={data.title || ""}
          onFirstChange={(value) => handleDataChange(index, "title", value)}
          validation={data.validation?.title}
          disabled={disabled}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <DoubleSideInput
          id={`memberSince_${index}`}
          label={t("profile.member_since")}
          firstPlaceholder={t("profile.e.g")}
          firstValue={data.memberSince || ""}
          onFirstChange={(value) =>
            handleDataChange(index, "memberSince", value)
          }
          validation={data.validation?.memberSince}
          disabled={disabled}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <SelectBox
          id={`licenceNumber_${index}`}
          placeholder={t("profile.select_license_type")}
          value={data.licenceNumber || ""}
          options={LICENSE_OPTIONS}
          onSelectChange={(id, value) =>
            handleDataChange(index, "licenceNumber", value)
          }
          validation={data.validation?.licenceNumber}
          disabled={disabled}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <InputBox
          id={`description_${index}`}
          placeholder={t("profile.give_description_certification")}
          value={data.description || ""}
          onInputChange={(id, value) =>
            handleDataChange(index, "description", value)
          }
          type={FIELD_TYPES.description}
          validation={data.validation?.description}
          maxLength={150}
          multiline
          rows={3}
          disabled={disabled}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 93,
            },
            "& .MuiInputBase-input": {
              height: "auto !important",
              paddingLeft: "14px !important",
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        {onRemove && (
          <Button
            variant="text"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            onClick={onRemove}
            disabled={disabled}
            sx={{
              color: "error.main",
            }}
          >
            {t("profile.remove")}
          </Button>
        )}
        {isLast && onAdd && (
          <Button
            variant="text"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={disabled}
            sx={{
              color: "primary.main",
            }}
          >
            {t("profile.add_more")}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default ProfessionalAffiliation;
