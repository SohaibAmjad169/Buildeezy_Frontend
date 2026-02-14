import { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  Select,
  MenuItem,
  Paper,
  Avatar,
  Modal,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import BrushIcon from "@mui/icons-material/Brush";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import LanguageIcon from "@mui/icons-material/Language";
import CloseIcon from "@mui/icons-material/Close";
import BarChartIcon from "@mui/icons-material/BarChart";
import GridViewIcon from "@mui/icons-material/GridView";
import SpeakerIcon from "@mui/icons-material/Speaker";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import HorizontalSplitIcon from "@mui/icons-material/HorizontalSplit";
import {
  CallRecordingList,
  DeviceSelectorAudioInput,
  DeviceSelectorAudioOutput,
  DeviceSelectorVideo,
  useCall,
} from "@stream-io/video-react-sdk";
import CallStatsPanel from "./CallStatsPanel";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { useEffect } from "react";
import { useMediaQuery } from "@mui/material";

const CustomSettingsPanel = ({ onClose, open = true, isDarkMode, layout, setLayout, language, setLanguage }) => {
  const [activeTab, setActiveTab] = useState("device");
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.down("md"));

  const LayoutSettings = () => {
    const layoutOptions = [
      {
        value: "grid",
        label: "Grid",
        icon: <GridViewIcon fontSize="small" />,
        description: "Equal sized tiles for all participants",
      },
      {
        value: "top",
        label: "Speaker [top]",
        icon: <HorizontalSplitIcon fontSize="small" style={{ transform: "rotate(180deg)" }} />,
        description: "Speaker on top, participants below",
      },
      {
        value: "bottom",
        label: "Speaker [bottom]",
        icon: <HorizontalSplitIcon fontSize="small" />,
        description: "Speaker at bottom, participants above",
      },
      {
        value: "left",
        label: "Speaker [left]",
        icon: <VerticalSplitIcon fontSize="small" style={{ transform: "rotate(180deg)" }} />,
        description: "Speaker on the left side",
      },
      {
        value: "right",
        label: "Speaker [right]",
        icon: <VerticalSplitIcon fontSize="small" />,
        description: "Speaker on the right side",
      },
    ];

    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 600, color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            Layout Settings
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isDarkMode ? "#b3b3b3" : "#666", mb: 2 }}
          >
            Choose how participants appear in your meeting
          </Typography>
        </Box>

        <Select
          value={layout}
          onChange={(e) => setLayout(e.target.value)}
          fullWidth
          sx={{
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#1a1a1a",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDarkMode ? "#555" : "#ddd",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#709A1C",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#709A1C",
            },
          }}
        >
          {layoutOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: "#709A1C",
                    color: "#fff",
                  }}
                >
                  {option.icon}
                </Avatar>
                <Typography>{option.label}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  };

  const LanguageSettings = () => {
    // const [language, setLanguage] = useState("en");

    const languages = [
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "fr", name: "French", flag: "🇫🇷" },
    ];

    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 600, color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            Language Settings
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isDarkMode ? "#b3b3b3" : "#666", mb: 2 }}
          >
            Select your preferred language for the interface
          </Typography>
        </Box>

        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          fullWidth
          sx={{
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#1a1a1a",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDarkMode ? "#555" : "#ddd",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#709A1C",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#709A1C",
            },
          }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography sx={{ fontSize: "1.2em" }}>{lang.flag}</Typography>
                <Typography>{lang.name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  };

  const DeviceSettings = () => {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: isDarkMode ? "#fff" : "#1a1a1a" }}>
            Device Settings
          </Typography>
          <Typography variant="body2" sx={{ color: isDarkMode ? "#b3b3b3" : "#666", mb: 3 }}>
            Configure your camera, microphone, and speaker
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: isDarkMode ? "#2a2a2a" : "#f9f9f9",
              border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ bgcolor: "#709A1C", mr: 2 }}>
                <VideocamIcon />
              </Avatar>
              <Typography variant="h6" sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                Camera
              </Typography>
            </Box>
            <DeviceSelectorVideo
              title=""
              visualType="dropdown"
            />
          </Paper>

          <Paper
            sx={{
              p: 3,
              backgroundColor: isDarkMode ? "#2a2a2a" : "#f9f9f9",
              border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ bgcolor: "#709A1C", mr: 2 }}>
                <BrushIcon />
              </Avatar>
              <Typography variant="h6" sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                Microphone
              </Typography>
            </Box>
            <DeviceSelectorAudioInput
              title=""
              visualType="dropdown"
            />
          </Paper>

          <Paper
            sx={{
              p: 3,
              backgroundColor: isDarkMode ? "#2a2a2a" : "#f9f9f9",
              border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ bgcolor: "#709A1C", mr: 2 }}>
                <SpeakerIcon />
              </Avatar>
              <Typography variant="h6" sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                Speaker
              </Typography>
            </Box>
            <DeviceSelectorAudioOutput
              title=""
              visualType="dropdown"
            />
          </Paper>
        </Box>
      </Box>
    );
  };

  const RecordingLibrary = () => {
    const call = useCall();
    const [recordings, setRecordings] = useState([]);

    useEffect(() => {
      const fetchRecordings = async () => {
        if (call?.listRecordings) {
          try {
            const result = await call.listRecordings();
            setRecordings(result.recordings);
          } catch (error) {
            console.error('Error fetching recordings:', error);
          }
        } else {
          console.warn('listRecordings is not available on this call');
        }
      };

      fetchRecordings();
    }, [call]);

    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: isDarkMode ? "#fff" : "#1a1a1a" }}>
            Recording Library
          </Typography>
          <Typography variant="body2" sx={{ color: isDarkMode ? "#b3b3b3" : "#666", mb: 3 }}>
            Access your recorded meetings and sessions
          </Typography>
        </Box>

        <Paper
          sx={{
            p: 3,
            backgroundColor: isDarkMode ? "#2a2a2a" : "#f9f9f9",
            border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`,
            minHeight: "200px",
          }}
        >
          <CallRecordingList callRecordings={recordings} />
        </Paper>
      </Box>
    );
  };

  const StatisticsSettings = () => {
    return (
      <Box sx={{ px: { xs: 0, sm: 1.5 }, py: 2 }}>
        <CallStatsPanel isDarkMode={isDarkMode} isCloseIcon={false} />
      </Box>
    );
  };

  const menuItems = [
    { key: "device", label: "Device", icon: <VideocamIcon />, component: <DeviceSettings /> },
    { key: "statistics", label: "Statistics", icon: <BarChartIcon />, component: <StatisticsSettings /> },
    { key: "layout", label: "Layout", icon: <ViewQuiltIcon />, component: <LayoutSettings /> },
    { key: "language", label: "Language", icon: <LanguageIcon />, component: <LanguageSettings /> },
    { key: "recordings", label: "Recordings", icon: <VideoLibraryIcon />, component: <RecordingLibrary /> },
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(item => item.key === activeTab);
    return activeItem?.component || null;
  };

  const getBgColor = () => (isDarkMode ? "#19232D" : "#f8f9fa");
  const getPanelBgColor = () => (isDarkMode ? "#19232D" : "#ffffff");
  const getBorderColor = () => (isDarkMode ? "#333" : "#e5e7eb");
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#000000");

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: isMdScreen ? "100%" : 720,
          height: "90vh",
          display: "flex",
          flexDirection: "row",
          bgcolor: getPanelBgColor(),
          color: getTextColor(),
          boxShadow: 24,
          outline: "none",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            width: isMdScreen ? "72px" : "220px",
            borderRight: `1px solid ${getBorderColor()}`,
            backgroundColor: getBgColor(),
            p: isMdScreen ? 1 : 2,
          }}
        >
          <Box sx={{ mb: 3, display: isMdScreen ? "none" : "block" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: getTextColor(), px: 1 }}>
              Settings
            </Typography>
          </Box>

          <List sx={{ p: 0 }}>
            {menuItems.map((item) => (
              <ListItem
                key={item.key}
                button
                selected={activeTab === item.key}
                onClick={() => setActiveTab(item.key)}
                sx={{
                  borderRadius: "12px",
                  transition: "all 0.2s ease",
                  mb: 1,
                  "&.Mui-selected": {
                    backgroundColor: "#709A1C !important",
                    color: "#ffffff",
                    "& .MuiListItemIcon-root": {
                      color: "#ffffff",
                    },
                    "& .MuiTypography-root": {
                      color: "#ffffff",
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: activeTab === item.key ? "#fff" : getTextColor(),
                    minWidth: isMdScreen ? "auto" : "40px",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    display: isMdScreen ? "none" : "block",
                    "& .MuiTypography-root": {
                      fontWeight: activeTab === item.key ? 600 : 400,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: `1px solid ${getBorderColor()}`,
              backgroundColor: getPanelBgColor(),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: getTextColor() }}>
              {menuItems.find(item => item.key === activeTab)?.label}
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{
                color: getTextColor(),
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 1, sm: 1, md: 1.5 },
              mb: 2,
              overflowY: "auto",
              backgroundColor: getPanelBgColor(),
            }}
          >
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomSettingsPanel;