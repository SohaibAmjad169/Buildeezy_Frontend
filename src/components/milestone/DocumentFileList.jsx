import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Paper,
  Collapse,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ai from "../../assets/images/ai.png";
import zip from "../../assets/images/zip.png";
import pdf from "../../assets/images/pdf.png";
import png from "../../assets/images/png.png";
import mp4 from "../../assets/images/mp4.png";
import link from "../../assets/images/link.png";
import download from "../../assets/images/download.png";
import deletet from "../../assets/images/deletet.png";
import MuiDialog from "../common/MuiDialog";
import { useTranslation } from "react-i18next";

export default function FileManagement() {
  const { t } = useTranslation();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedDays, setExpandedDays] = useState({
    "Tue, 29 Oct 2024": true,
    "Mon, 28 Oct 2024": true,
  });

  const toggleDay = (day) => {
    setExpandedDays({
      ...expandedDays,
      [day]: !expandedDays[day],
    });
  };

  // Example data provided by you
  const filesByDate = {
    filesByDate: {
      "2025-06-11": {
        count: 2,
        files: [
          {
            uploader: {
              name: "Alice Johnson",
              avatar: "https://via.placeholder.com/40",
              time: "9:15 AM",
            },
            fileInfo: {
              file_name: "design-assets.zip",
              file_size: "5 MB",
              file_icon: "zip",
            },
            actions: [
              {
                title: "Copy Link",
                icon: "link",
                size: { width: 20, height: 10 },
              },
              {
                title: "Download",
                icon: "download",
                size: { width: 18, height: 18 },
              },
              {
                title: "Delete",
                icon: "deletet",
                size: { width: 18, height: 18 },
              },
            ],
          },
          {
            uploader: {
              name: "Bob Smith",
              avatar: "https://via.placeholder.com/40",
              time: "10:45 AM",
            },
            fileInfo: {
              file_name: "project-plan.docx",
              file_size: "1.2 MB",
              file_icon: "pdf",
            },
            actions: [
              {
                title: "Copy Link",
                icon: "link",
                size: { width: 20, height: 10 },
              },
              {
                title: "Download",
                icon: "download",
                size: { width: 18, height: 18 },
              },
              {
                title: "Delete",
                icon: "deletet",
                size: { width: 18, height: 18 },
              },
            ],
          },
        ],
      },
      "2025-07-21": {
        count: 2,
        files: [
          {
            uploader: {
              name: "Charlie Davis",
              avatar: "https://via.placeholder.com/40",
              time: "3:30 PM",
            },
            fileInfo: {
              file_name: "meeting-recording.mp4",
              file_size: "15 MB",
              file_icon: "mp4",
            },
            actions: [
              {
                title: "Copy Link",
                icon: "link",
                size: { width: 20, height: 10 },
              },
              {
                title: "Download",
                icon: "download",
                size: { width: 18, height: 18 },
              },
              {
                title: "Delete",
                icon: "deletet",
                size: { width: 18, height: 18 },
              },
            ],
          },
          {
            uploader: {
              name: "Diana Prince",
              avatar: "https://via.placeholder.com/40",
              time: "4:50 PM",
            },
            fileInfo: {
              file_name: "team-photo.png",
              file_size: "3 MB",
              file_icon: "png",
            },
            actions: [
              {
                title: "Copy Link",
                icon: "link",
                size: { width: 20, height: 10 },
              },
              {
                title: "Download",
                icon: "download",
                size: { width: 18, height: 18 },
              },
              {
                title: "Delete",
                icon: "deletet",
                size: { width: 18, height: 18 },
              },
            ],
          },
        ],
      },
    },
  };

  // Icon map for files
  const fileIcons = { zip, mp4, ai, png, pdf };

  // Icon map for actions
  const actionIcons = { link, download, deletet };

  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  function onDeleteDoc() {
    console.log("delete succsessflly");
  }

  function onClose() {
    setOpenDialog(false);
  }

  return (
    <Box sx={{ margin: "0 auto" }}>
      {Object.entries(filesByDate.filesByDate).map(([date, data]) => (
        <Box key={date} sx={{ my: 2 }}>
          <Box
            onClick={() => toggleDay(date)}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              mb: 2,
              "&:hover": { opacity: 0.7 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="h6"
                component="h2"
                // sx={{ fontWeight: 500, color: "#000", fontSize: "16px" }}
                sx={(theme) => ({
  fontWeight: 500,
  fontSize: "16px",
  color: theme.palette.mode === "dark" ? "#E4E7EC" : "#000", // or use theme.palette.text.primary
})}
              >
                {formatDate(date)}{" "}
                <Box component="span" 
                // sx={{ color: "#D0D5DD" }}
                  sx={(theme) => ({
                 color: theme.palette.mode === "dark" ? "#D0D5DD" : "#475467",
                   })}
                >
                  ({data.count} files)
                </Box>
              </Typography>
              {expandedDays[date] ? (
                <KeyboardArrowDown sx={{ color: "#666" }} />
              ) : (
                <KeyboardArrowRight sx={{ color: "#666" }} />
              )}
            </Box>
          </Box>

          <Collapse in={expandedDays[date]}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {data.files.map((file, index) => (
                <Box key={index}>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar
                      alt={file.uploader.name}
                      src={file.uploader.avatar}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box>
                      <Typography
                        // sx={{
                        //   fontWeight: 500,
                        //   color: "#000",
                        //   fontSize: "14px",
                        // }}
                        sx={(theme) => ({
  fontWeight: 500,
  fontSize: "14px",
  color: theme.palette.mode === "dark" ? "#E4E7EC" : "#000", // or use theme.palette.text.primary
})}
                      >
                        {file.uploader.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: "gray" }} />
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: 12 }}
                        >
                          {file.uploader.time}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    elevation={1}
                    sx={{
                      border: `1px solid #D0D5DD`,
                      px: 2,
                      py: 1.5,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={3}>
                      <Avatar
                        src={fileIcons[file.fileInfo.file_icon]}
                        alt={file.fileInfo.file_icon}
                        variant="rounded"
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "transparent",
                          objectFit: "contain",
                        }}
                      />

                      <Box>
                        <Typography variant="body2">
                          {file.fileInfo.file_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {file.fileInfo.file_size}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                      {file.actions.map((action, idx) => (
                        <Tooltip title={action.title} key={idx}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (action.title === "Delete") {
                                setSelectedFile(file); // Store file info if delete clicked
                                setOpenDialog(true); // Open confirmation dialog
                              } else {
                                // handle other actions like Download, Copy Link here
                                console.log(`${action.title} clicked`);
                              }
                            }}
                          >
                            <Box
                              component="img"
                              src={actionIcons[action.icon]}
                              alt={action.title}
                              sx={{
                                width: action.size.width,
                                height: action.size.height,
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      ))}
      <MuiDialog
        title={t("milestone.doc_delete")}
        open={openDialog}
        handleClose={onClose}
        handleSuccess={onDeleteDoc}
      />
    </Box>
  );
}
