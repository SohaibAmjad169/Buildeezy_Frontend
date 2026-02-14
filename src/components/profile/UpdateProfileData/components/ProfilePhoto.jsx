import { Box } from "@mui/material";
import MuiTypography from "../../../common/MuiTypography";
import UploadProfile from "../../UploadProfile";
import { useTranslation } from "react-i18next";

function ProfilePhoto({ tempAvatar, onPicChange }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "flex-start" },
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "50%" },
            pr: { xs: 0, sm: 3 },
            mb: { xs: 1, sm: 0 },
            pt: { sm: 1 },
          }}
        >
          <MuiTypography variant="h5">
            {t("profile.your_photo")}
            <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
              *
            </Box>
          </MuiTypography>
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "50%" }, display: "flex" }} data-tour="profile-photo-upload">
          <Box sx={{ width: "100%" }} >
            <UploadProfile onPicChange={onPicChange} tempAvatar={tempAvatar} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ProfilePhoto;
