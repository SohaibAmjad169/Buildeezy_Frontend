import { Box, Stack, Divider, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import Typography from "../../../common/MuiTypography";
import UpdateProfileForm from "../UpdateProfileForm";
import ProfilePhoto from "../components/ProfilePhoto";
import SaveCancelButtons from "../../../common/SaveCancelButtons";
import ShareIcon from "../../../common/icons/ShareIcon";
import ShareMenu from "../../../common/ShareMenu";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useSelector } from "react-redux";
import { useState } from "react";
import QRCode from "react-qr-code";
import { IconButton, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { USER_TYPES } from "../../../../utils/constants/login";

function PersonalInformation({
  tempAvatar,
  onPicChange,
  fields,
  onSaveProfile,
  onFieldChange,
  setSaveProfile,
  handleSaveClick,
  handleCancel,
  onIdDocumentsChange,
}) {
  const { t } = useTranslation();
  const profileData = useSelector((state) => state.profile.profileData);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const isAdmin = profileData?.userType === USER_TYPES.admin;

  const handleShareClick = (e) => {
    setShareAnchorEl(e.currentTarget);
  };
  const handleShareClose = () => {
    setShareAnchorEl(null);
  };
  const handleQrOpen = () => setQrOpen(true);
  const handleQrClose = () => setQrOpen(false);

  // User profile link for sharing/QR
  const userProfileUrl = !isAdmin
    ? `${window.location.origin}/dashboard/view/${profileData?.id}/profile`
    : `${window.location.origin}/admin/profile`;
  const userName = `${profileData?.firstName || ""} ${
    profileData?.lastName || ""
  }`.trim();

  return (
    <Stack>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 3,
          pb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h2">
            {t("profile.personal_information")}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "normal",
            }}
          >
            {t("profile.update_details")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={handleShareClick}>
            <ShareIcon
              size={22}
              // color="#131a47"
              sx={(theme) => ({
                fontSize: 26,
                color: theme.palette.mode === "dark" ? "#E4E7EC" : "#131a47",
              })}
            />
          </IconButton>
          <IconButton onClick={handleQrOpen}>
            <QrCodeScannerIcon
              //  sx={{ fontSize: 26, color: "#131a47" }}
              sx={(theme) => ({
                fontSize: 26,
                color: theme.palette.mode === "dark" ? "#E4E7EC" : "#131a47",
              })}
            />
          </IconButton>
          <SaveCancelButtons
            onSave={handleSaveClick}
            onCancel={handleCancel}
            label={t("common.save")}
          />
        </Box>
        <ShareMenu
          anchorEl={shareAnchorEl}
          onClose={handleShareClose}
          headline={userName}
          url={userProfileUrl}
        />
        <Dialog open={qrOpen} onClose={handleQrClose}>
          <DialogTitle>{t("profile.share_profile_via_qr_code")}</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 4,
            }}
          >
            <QRCode value={userProfileUrl} size={200} />
            <Box
              sx={{
                mt: 2,
                wordBreak: "break-all",
                textAlign: "center",
                fontSize: 14,
              }}
            >
              {userProfileUrl}
            </Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3, minWidth: 180 }}
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: userName,
                      text: t(
                        "profile.share_profile",
                        "Check out this profile!"
                      ),
                      url: userProfileUrl,
                    });
                  } catch {
                    // User cancelled or error
                  }
                } else {
                  await navigator.clipboard.writeText(userProfileUrl);
                  alert(
                    t(
                      "profile.link_copied",
                      "Profile link copied to clipboard!"
                    )
                  );
                }
              }}
            >
              {t("profile.share")}
            </Button>
          </DialogContent>
        </Dialog>
      </Box>

      <Divider sx={{ width: "100%", mb: 4 }} />

      <ProfilePhoto
        tempAvatar={tempAvatar}
        onPicChange={onPicChange}
        sx={{ mb: 3 }}
      />

      <Divider sx={{ width: "100%", mt: 3 }} />

      <UpdateProfileForm
        fields={fields}
        onSaveChanges={onSaveProfile}
        onFieldChange={onFieldChange}
        onValidateAndTransform={setSaveProfile}
        handleSaveClick={handleSaveClick}
        handleCancel={handleCancel}
        onIdDocumentsChange={onIdDocumentsChange}
      />
    </Stack>
  );
}

export default PersonalInformation;
