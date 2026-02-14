import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { colors } from "../../../styles/theme";

const PreviewButton = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="text"
      startIcon={<RemoveRedEyeOutlinedIcon />}
      onClick={onClick}
      sx={{
        backgroundColor: colors.green100,
        color: colors.green800,
        "&:hover": {
          backgroundColor: colors.green100,
          color: colors.green800,
        },
      }}
    >
      {t("profile.design.preview")}
    </Button>
  );
};

export default PreviewButton;
