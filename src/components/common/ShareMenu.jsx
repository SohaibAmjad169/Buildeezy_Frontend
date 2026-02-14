import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import XIcon from "./icons/XIcon";

const ShareMenu = ({ anchorEl, onClose, headline, url }) => {
  const { t } = useTranslation();
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleSharePlatform = (platform) => () => {
    const text = `${headline}\n${url}`;
    let shareUrl;

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "x":
        shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;

      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(headline)}&body=${encodeURIComponent(text)}`;
        onClose();
        return;
      case "copy":
        navigator.clipboard.writeText(text);
        setShowCopySuccess(true);
        onClose();
        return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            mt: 1,
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <MenuItem onClick={handleSharePlatform("whatsapp")}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" sx={{ color: "#128C7E" }} />
          </ListItemIcon>
          <ListItemText
            primary="WhatsApp"
            primaryTypographyProps={{
              sx: { fontSize: "0.75rem" },
            }}
          />
        </MenuItem>
        <MenuItem onClick={handleSharePlatform("facebook")}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" sx={{ color: "#3b5998" }} />
          </ListItemIcon>
          <ListItemText
            primary="Facebook"
            primaryTypographyProps={{
              sx: { fontSize: "0.75rem" },
            }}
          />
        </MenuItem>
        <MenuItem onClick={handleSharePlatform("x")}>
          <ListItemIcon>
            <XIcon fontSize="small" sx={{ color: "#14171A" }} />
          </ListItemIcon>
          <ListItemText
            primary="X"
            primaryTypographyProps={{
              sx: { fontSize: "0.75rem" },
            }}
          />
        </MenuItem>

        <MenuItem onClick={handleSharePlatform("email")}>
          <ListItemIcon>
            <EmailIcon
              fontSize="small"
              sx={{
                color: "#1976d2",
                borderRadius: "50%",
                background: "white",
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Email"
            primaryTypographyProps={{
              sx: { fontSize: "0.75rem" },
            }}
          />
        </MenuItem>
        <MenuItem onClick={handleSharePlatform("copy")}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" sx={{ color: "#5f6368" }} />
          </ListItemIcon>
          <ListItemText
            primary="Copy Link"
            primaryTypographyProps={{
              sx: { fontSize: "0.75rem" },
            }}
          />
        </MenuItem>
      </Menu>

      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={() => setShowCopySuccess(false)}
        message={t("learning.link_copied")}
      />
    </>
  );
};

ShareMenu.propTypes = {
  anchorEl: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  headline: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default ShareMenu;
