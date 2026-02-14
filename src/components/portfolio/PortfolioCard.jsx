import PropTypes from "prop-types";
import { Box, Card, CardActionArea, Stack, styled, IconButton, Menu, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

import MuiTypography from "../common/MuiTypography";
import {
  getAllFirstCharUpperCase,
  getFirstCharUpperCase,
} from "../../utils/common";
import { getDocIcon, getFileType } from "../../utils/file";

const StyledCard = styled(Card)(({ theme }) => ({
  "&": {
    borderRadius: "1rem",
    width: "100%",
    minHeight: 420,
    padding: 0,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    boxShadow:
      "0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)",
    transition: "all 0.2s ease-in-out",
  },
  "&:not(.disabled):hover": {
    transform: "translateY(-4px)",
    boxShadow:
      "0px 4px 8px rgba(16, 24, 40, 0.1), 0px 2px 4px rgba(16, 24, 40, 0.06)",
    border: `solid ${theme.palette.primary.main} 1px`,
  },
}));

export default function PortfolioCard({
  projectId,
  title,
  role,
  description,
  thumbnail,
  files,
  showActions = false,
  onEdit,
  onDelete,
  onClick,
}) {
  const navigate = useNavigate();
  const [resolvedThumbnail, setResolvedThumbnail] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    handleMenuClose();
    if (onEdit) onEdit(projectId);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleMenuClose();
    if (onDelete) onDelete(projectId);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/profile/portfolio/view/${projectId}`);
    }
  };

  useEffect(() => {
    if (typeof thumbnail === "string" && thumbnail) {
      setResolvedThumbnail(thumbnail);
    } else if (thumbnail && typeof thumbnail === "object") {
      if (thumbnail instanceof File) {
        setResolvedThumbnail(URL.createObjectURL(thumbnail));
      } else if (thumbnail.url) {
        setResolvedThumbnail(thumbnail.url);
      } else if (thumbnail.imageDataUrl) {
        setResolvedThumbnail(thumbnail.imageDataUrl);
      } else {
        setResolvedThumbnail("");
      }
    } else if (files && files.length > 0 && files[0].url) {
      setResolvedThumbnail(files[0].url);
    } else {
      setResolvedThumbnail("");
    }
  }, [thumbnail, files]);

  const renderMedia = () => {
    let displayUrl = resolvedThumbnail;
    if (!displayUrl) {
      return (
        <Box
          sx={{
            placeItems: "center",
            display: "grid",
            width: "100%",
            height: 240,
            bgcolor: "paginationBg",
            mb: 2,
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem",
          }}
        >
          <Box
            component="img"
            src={getDocIcon("")}
            alt="no-file"
            sx={{
              height: 48,
              width: 48,
            }}
          />
        </Box>
      );
    }

    if (
      (typeof displayUrl === "string" &&
        displayUrl.startsWith("data:image/")) ||
      getFileType(displayUrl) === "image"
    ) {
      return (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 240,
            mb: 2,
            overflow: "hidden",
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem",
          }}
        >
          <Box
            component="img"
            src={displayUrl}
            alt="portfolio-image"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          placeItems: "center",
          display: "grid",
          width: "100%",
          height: 240,
          bgcolor: "paginationBg",
          mb: 2,
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
        }}
      >
        <Box
          component="img"
          src={getDocIcon(displayUrl)}
          alt="portfolio-file"
          sx={{
            height: 48,
            width: 48,
          }}
        />
      </Box>
    );
  };

  return (
    <StyledCard>
      {/* Actions Menu - positioned absolutely in top right */}
      {showActions && (
        <>
          <IconButton
            onClick={handleMenuClick}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={handleEdit}>
              <EditIcon sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </>
      )}
      
      <CardActionArea onClick={handleCardClick}>
        {renderMedia()}
        <Stack spacing={1} sx={{ p: 2 }}>
          <MuiTypography
            variant="subtitle2"
            className="text-ellipsis"
            sx={{
              maxWidth: 280,
              fontSize: "0.9rem",
              textAlign: "justify",
              color: "primary.main",
              fontWeight: 500,
            }}
          >
            {role || "No Role"}
          </MuiTypography>
          <MuiTypography
            variant="body2"
            className="text-ellipsis"
            sx={{
              maxWidth: 280,
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            {title ? getAllFirstCharUpperCase(title) : "Untitled Project"}
          </MuiTypography>
          <MuiTypography
            variant="subtitle2"
            className="text-ellipsis-line-2"
            sx={{
              maxWidth: 280,
              minHeight: "35px",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "text.secondary",
            }}
          >
            {description
              ? getFirstCharUpperCase(description)
              : "No description available"}
          </MuiTypography>
        </Stack>
      </CardActionArea>
    </StyledCard>
  );
}

PortfolioCard.propTypes = {
  projectId: PropTypes.number,
  title: PropTypes.string,
  role: PropTypes.string,
  description: PropTypes.string,
  thumbnail: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      url: PropTypes.string,
      type: PropTypes.string,
      size: PropTypes.number,
      dimensions: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
      }),
    }),
  ]),
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
      type: PropTypes.string,
      size: PropTypes.number,
    })
  ),
  showActions: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
};
