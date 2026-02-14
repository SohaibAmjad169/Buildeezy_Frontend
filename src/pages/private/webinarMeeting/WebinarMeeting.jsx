import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStreamClient } from "./streamClient";
import {
  PaginatedGridLayout,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";
import {
  Box,
  IconButton,
  Drawer,
  useTheme,
  MenuItem,
  Menu,
  Tooltip,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import './ChatCustomStyles.scss';
import { BarChart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useMediaQuery } from "@mui/material";
import CustomSettingsPanel from "./CustomSettingsPanel";
import CallStatsPanel from "./CallStatsPanel";
import ParticipantsPanel from "./ParticipantsPanel";
import ChatPanel from "./ChatPanel";
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  CustomCancelCallButton,
  CustomReactionButton,
  CustomRecordCallButton,
  CustomScreenShareButton,
  CustomToggleAudioPublishingButton,
  CustomToggleVideoPublishingButton
} from "./ControlsPanel";
import { useSelector } from "react-redux";

const WebinarMeeting = () => {
  const { callId } = useParams();
  console.log("🚀 ~ WebinarMeeting ~ callId:", callId)
  const [call, setCall] = useState(null);
  const [videoClient, setVideoClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [drawerContent, setDrawerContent] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [i18nInstance, setI18nInstance] = useState(null);
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate()

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMdUp = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = (e) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // useEffect(() => {
  //   const setup = async () => {
  //     try {
  //       const { videoClient, chatClient } = await getStreamClient();
  //       setVideoClient(videoClient);
  //       setChatClient(chatClient);

  //       const call = videoClient.call("default", callId);
  //       await call.getOrCreate();
  //       await call.join();
  //       setCall(call);

  //       const chatChannel = chatClient.channel("livestream", callId, {
  //         name: `Chat for ${callId}`,
  //       });
  //       await chatChannel.watch();
  //       setChannel(chatChannel);
  //     } catch (err) {
  //       console.error("Setup error:", err);
  //     }
  //   };

  //   setup();
  // }, [callId]);

  useEffect(() => {
    const setup = async () => {
      try {
        const { videoClient, chatClient, i18nInstance } = await getStreamClient(language);
        setVideoClient(videoClient);
        setChatClient(chatClient);
        setI18nInstance(i18nInstance); // New state to store i18n instance

        const call = videoClient.call("default", callId);
        await call.getOrCreate();
        await call.join();
        setCall(call);

        const chatChannel = chatClient.channel("livestream", callId, {
          name: `Chat for ${callId}`,
        });
        await chatChannel.watch();
        setChannel(chatChannel);
      } catch (err) {
        console.error("Setup error:", err);
      }
    };

    setup();
  }, [callId, language]); // re-run on language change


  const renderDrawerContent = () => {
    switch (drawerContent) {
      case "chat":
        return <ChatPanel
          chatClient={chatClient}
          channel={channel}
          onClose={() => setDrawerContent(null)}
          isDarkMode={isDarkMode}
          i18nInstance={i18nInstance}
        />
      case "callStats":
        return <CallStatsPanel isDarkMode={isDarkMode} onClose={() => setDrawerContent(null)} />
      case "participants":
        return <ParticipantsPanel onClose={() => setDrawerContent(null)} isDarkMode={isDarkMode} />
      default:
        return null;
    }
  };

  if (!videoClient || !chatClient || !call || !channel) return <div>{t("webinar.joining_meeting")}</div>;

  return (
    <Box sx={{ position: "relative" }} className={`${isDarkMode ? "dark" : "light"}`}>
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <StreamTheme>

            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    flexGrow: 1,
                    width: drawerContent ? "calc(100% - 320px)" : "100%",
                    transition: "width 0.3s ease",
                    overflow: "hidden",
                  }}
                >
                  {layout === "grid" ? (
                    <PaginatedGridLayout groupSize={4} />
                  ) : ["top", "bottom", "left", "right"].includes(layout) ? (
                    <SpeakerLayout participantsBarPosition={layout} />
                  ) : (
                    null
                  )}
                  {/* <SpeakerLayout /> */}
                </Box>

                {drawerContent && (
                  <Box
                    sx={{
                      width: "320px",
                      backgroundColor: isDarkMode ? "#19232D" : "white",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: { lg: "14px", xs: 0 },
                      ml: { lg: 4, xs: 0 },
                      border: isDarkMode
                        ? "1px solid #1e293b"
                        : "1px solid #E5E7EB",
                      overflow: "hidden",
                      height: { lg: "72vh", xs: "calc(100vh - 70px)" },
                      position: { lg: "relative", xs: "fixed" },
                      top: { xs: "70px", lg: "auto" },
                      right: { xs: 0, lg: "auto" },
                      zIndex: { xs: 1300, lg: "auto" },
                      // boxShadow: { xs: 6, lg: "none" },
                      transition: "transform 0.3s ease-in-out",
                    }}
                  >
                    {renderDrawerContent()}
                  </Box>
                )}

              </Box>

              <Box
                sx={{
                  position: "absolute",
                  right: 0,
                  bottom: -100,
                  height: 70,
                  backgroundColor: isDarkMode ? "#19232D" : "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  borderRadius: "40px",
                  px: 2,
                  width: "100%",
                  boxShadow: isDarkMode
                    ? "0px 4px 12px rgba(0,0,0,0.2)"
                    : "0px 4px 10px rgba(0,0,0,0.1)",
                  border: "1px solid #0000001F",
                }}
              >
                {/* Left Side */}
                {!isMobile && (
                  <Tooltip title="Setting"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: "#709A1C",
                          color: "white",
                          fontSize: "13px",
                          borderRadius: "8px",
                        },
                      },
                    }}
                  >
                    <IconButton
                      onClick={() => setSettingsOpen(true)}
                      sx={{
                        bgcolor: "#709A1C",
                        p: "9px",
                        "&:hover": { bgcolor: "#4E6B13" },
                      }}
                    >
                      <SettingsIcon fontSize="small" sx={{ color: "white" }} />
                    </IconButton>
                  </Tooltip>
                )}

                {settingsOpen && (
                  <CustomSettingsPanel
                    onClose={() => setSettingsOpen(false)}
                    open={settingsOpen}
                    isDarkMode={isDarkMode}
                    layout={layout}
                    setLayout={setLayout}
                    language={language}
                    setLanguage={setLanguage}
                  />
                )}

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                  }}
                >
                  {/* Mobile: only 3 icons (audio, video, screen share) */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      "@media (min-width: 501px)": {
                        display: "none",
                      },
                    }}
                  >
                    <CustomToggleAudioPublishingButton />
                    <CustomToggleVideoPublishingButton />
                    <CustomScreenShareButton />
                    <CustomReactionButton />
                  </Box>

                  {/* Desktop: show all 5 icons (including record + end call) */}
                  <Box
                    sx={{
                      display: "none",
                      gap: 1.5,
                      "@media (min-width: 501px)": {
                        display: "flex",
                      },
                    }}
                  >
                    <CustomToggleAudioPublishingButton />
                    <CustomToggleVideoPublishingButton />
                    <CustomScreenShareButton />
                    <CustomReactionButton />
                    <CustomRecordCallButton />
                    <CustomCancelCallButton />
                  </Box>
                </Box>

                {/* Right Side */}
                {!isMobile ? (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Tooltip title="Message"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#709A1C",
                            color: "white",
                            fontSize: "13px",
                            borderRadius: "8px",
                          },
                        },
                      }}
                    >
                      <IconButton
                        onClick={() => setDrawerContent("chat")}
                        sx={{
                          bgcolor: "#709A1C",
                          p: "9px",
                          "&:hover": { bgcolor: "#4E6B13" },
                        }}
                      >
                        <ChatBubbleOutlineIcon fontSize="small" sx={{ color: "white" }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Participates"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#709A1C",
                            color: "white",
                            fontSize: "13px",
                            borderRadius: "8px",
                          },
                        },
                      }}
                    >
                      <IconButton
                        onClick={() => setDrawerContent("participants")}
                        sx={{
                          bgcolor: "#709A1C",
                          p: "9px",
                          "&:hover": { bgcolor: "#4E6B13" },
                        }}
                      >
                        <GroupOutlinedIcon fontSize="small" sx={{ color: "white" }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Stats"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#709A1C",
                            color: "white",
                            fontSize: "13px",
                            borderRadius: "8px",
                          },
                        },
                      }}
                    >
                      <IconButton
                        onClick={() =>
                          setDrawerContent((prev) =>
                            prev === "callStats" ? null : "callStats"
                          )
                        }
                        sx={{
                          bgcolor: "#709A1C",
                          p: "9px",
                          "&:hover": { bgcolor: "#4E6B13" },
                        }}
                      >
                        <BarChart fontSize="small" sx={{ color: "white" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <>
                    <IconButton
                      onClick={handleMenuOpen}
                      sx={{
                        bgcolor: "#709A1C",
                        p: "9px",
                        "&:hover": { bgcolor: "#4E6B13" },
                      }}
                    >
                      <MoreVertIcon fontSize="small" sx={{ color: "white" }} />
                    </IconButton>

                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl)}
                      onClose={handleMenuClose}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      sx={{
                        "& .MuiPaper-root": {
                          minWidth: "200px",
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: "block",
                          gap: 1,
                          "@media (min-width: 501px)": {
                            display: "none",
                          },
                        }}
                      >
                        <CustomRecordCallButton />
                        <CustomCancelCallButton />
                      </Box>


                      <MenuItem
                        onClick={() => {
                          setSettingsOpen(true);
                          handleMenuClose();
                        }}
                      >
                        <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
                        Settings
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setDrawerContent("chat");
                          handleMenuClose();
                        }}
                      >
                        <ChatBubbleOutlineIcon sx={{ mr: 1 }} fontSize="small" />
                        Chat
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setDrawerContent("participants");
                          handleMenuClose();
                        }}
                      >
                        <GroupOutlinedIcon sx={{ mr: 1 }} fontSize="small" />
                        Participants
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setDrawerContent((prev) =>
                            prev === "callStats" ? null : "callStats"
                          );
                          handleMenuClose();
                        }}
                      >
                        <BarChart sx={{ mr: 1 }} fontSize="small" />
                        Call Stats
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Box>
            </Box >
          </StreamTheme >
        </StreamCall >
      </StreamVideo >
    </Box >
  );
};

export default WebinarMeeting;