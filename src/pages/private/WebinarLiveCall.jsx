import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  Stack,
  Divider,
  AccordionDetails,
  Paper,
  Accordion,
  AccordionSummary,
  InputAdornment,
} from "@mui/material";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VideocamOnIcon from "@mui/icons-material/Videocam";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicOnIcon from "@mui/icons-material/Mic";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useLocation, useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE, PUBNUB_CHANNEL } from "../../utils/constants/config";
import {
  getFilteredUsers,
  getMyWebinarUrl,
  grantAccessToRoom,
  notifyForNewMessage,
} from "../../apis/apiEndPoints";
import UserList from "../../components/Message/UserList";
import { addMessage } from "../../redux/pubnubSlice";
import { useEffect } from "react";
import moment from "moment-timezone";

const WebinarLiveCall = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const webinar = state?.webinar;
  const { pubnubInstance } = useSelector((state) => state.pubnub);
  const { profileData } = useSelector((state) => state.profile);

  const [stream, setStream] = useState(null);
  let videoRef = useRef(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const inviteLink = `${window.location.origin}/webinar/meeting/${webinar?.callId}`;
  const [webinarDetails, setWebinarDetails] = useState();
  const [registeredUsers, setRegisteredusers] = useState([]);

  const avatar = useSelector((state) => state.profile?.profileData?.avatar);

  //Fetching users with debouncing
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        let users = await getFilteredUsers(searchQuery);
        users = users.data?.data || [];
        users.forEach((i) => {
          i.isChecked = false;
          i.firstName = i.label;
          i.lastName = "";
        });
        //removing current user and already selected users
        users = removeDuplicates(users);
        users = [...selectedMembers, ...users];
        setFilteredUsers(users);
      } else {
        setSelectedMembers(selectedMembers);
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler); // cleanup on change/unmount
    };
  }, [searchQuery]);

  function removeDuplicates(users) {
    let registeredUsers = webinarDetails?.registeredUsers || [];
    const excludedIds = new Set([
      ...selectedMembers.map((u) => u.id),
      ...invitedMembers.map((u) => u.id),
      ...registeredUsers.map((u) => u.id),
      profileData.id,
    ]);

    // Filter out users whose id is in excludedIds
    return users.filter((user) => !excludedIds.has(user.id));
  }

  const selectMember = (user) => {
    let initialValue = selectedMembers.filter((i) => i.id !== user.id);
    user.isChecked = !user.isChecked;
    user.isChecked ? (initialValue = [...initialValue, user]) : "";
    setSelectedMembers([...initialValue]);
  };

  const addMember = () => {
    let totalMembers =
      invitedMembers.length + webinarDetails?.registeredUsers?.length;
    if (
      totalMembers + selectedMembers.length <=
      webinarDetails?.totalParticipants
    ) {
      setInvitedMembers([...invitedMembers, ...selectedMembers]);
      setSelectedMembers([]);
      setFilteredUsers([]);
      setSearchQuery("");
    } else {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: `Total Number of Participants should be <= ${webinarDetails?.totalParticipants}`,
        })
      );
    }
  };

  const discardSelection = () => {
    setInvitedMembers([]);
    setSelectedMembers([]);
    setSearchQuery("");
    let unChecked = filteredUsers;
    unChecked.forEach((i) => (i.isChecked = false));
    setFilteredUsers(unChecked);
  };

  const enableTrack = async (type) => {
    try {
      const constraints = {
        audio: type === "audio",
        video: type === "video",
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      const track =
        type === "audio"
          ? newStream.getAudioTracks()[0]
          : newStream.getVideoTracks()[0];

      if (!track) throw new Error(`No ${type} track found.`);

      // Add to existing stream or create a new one
      let updatedStream = stream
        ? new MediaStream(stream.getTracks())
        : new MediaStream();
      updatedStream.addTrack(track);
      setStream(updatedStream);

      //Attach to video element if video is enabled
      console.log("videoRef", videoRef?.current);
      if (type === "video" && videoRef.current) {
        videoRef.current.srcObject = updatedStream;
      }

      if (type === "audio") setIsAudioEnabled(true);
      if (type === "video") setIsVideoEnabled(true);
    } catch (err) {
      console.error(`Error enabling ${type}:`, err);
    }
  };

  const disableTrack = (type) => {
    if (!stream) return;

    const tracksToRemove =
      type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

    tracksToRemove.forEach((track) => {
      track.stop();
      stream.removeTrack(track);
    });

    const remainingTracks = stream
      .getTracks()
      .filter((t) => t.readyState !== "ended");
    setStream(remainingTracks.length ? new MediaStream(remainingTracks) : null);

    if (type === "audio") setIsAudioEnabled(false);
    if (type === "video") setIsVideoEnabled(false);
  };

  const toggleTrack = (type) => {
    if (
      (type === "audio" && isAudioEnabled) ||
      (type === "video" && isVideoEnabled)
    ) {
      disableTrack(type);
    } else {
      enableTrack(type);
    }
  };

  const copyToClipboard = () => {
    const tempInput = document.createElement("input");
    tempInput.value = inviteLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    dispatch(
      setAlert({
        show: true,
        type: ALERT_TYPE.info,
        message: "Copied To Clipboard",
      })
    );
  };

  const fetchWebinarDetails = async () => {
    try {
      const response = await getMyWebinarUrl(webinar?.id);
      setWebinarDetails(response?.data);
      setRegisteredusers(response?.data?.registeredUsers);
    } catch (error) {
      console.log("failed to fetch");
    }
  };

  useEffect(() => {
    fetchWebinarDetails();
  }, []);

  const sendInvites = async () => {
    await Promise.allSettled(
      invitedMembers.map(async (member) => {
        if (pubnubInstance) {
          const users = [profileData.id, member.id].sort();
          const channelId = `${PUBNUB_CHANNEL}_${users[0]}_${users[1]}`;

          //convert utc time to timezone selected while creating webinar
          let startDateTimeUTC = webinarDetails.startDate;
          let selectedTimeZone = webinarDetails.timeZone;
          const localTime = moment
            .utc(startDateTimeUTC)
            .tz(selectedTimeZone)
            .format("MMMM D, YYYY h:mm A");
          const inviteMessage = `
Hello ${member.firstName},

You’ve been invited to join a meeting.

📅 Date & Time: ${localTime} (${selectedTimeZone})
🔗 Join Link: ${inviteLink}

Please make sure to join on time.

Best regards,
${profileData.firstName} ${profileData.lastName}
`;

          const message = {
            text: inviteMessage,
            senderId: profileData.id,
            sender: `${profileData.firstName} ${profileData.lastName}`,
            receiverId: member.id,
            receiver: member.firstName + " " + member.lastName,
            time: new Date().getTime(),
          };

          try {
            await grantAccessToRoom({
              roomName: channelId,
              user1: profileData.id,
              user2: member.id,
            });
            await subscribeToChannel(channelId);
            // Await publish
            await pubnubInstance.publish({
              channel: channelId,
              message,
              storeInHistory: true,
            });

            if (profileData.id && member.Id) {
              await notifyNewMessage({
                fromUser: profileData.id,
                toUser: member.Id,
                content: `You are invited to join the meeting - ${inviteLink}`,
              });
            }

            // Dispatch immediately (not async)
            dispatch(addMessage({ channelId, message }));
            dispatch(
              setAlert({
                show: true,
                type: ALERT_TYPE.info,
                message: "Invitation Sent",
              })
            );
          } catch (error) {
            console.error(`Failed to send to ${member.Id}:`, error);
          }
        }
      })
    );
  };

  async function subscribeToChannel(channelId) {
    if (!pubnubInstance) {
      console.warn("⚠️ PubNub instance not ready, skipping subscribeToChannel");
      return;
    }

    try {
      await pubnubInstance.subscribe({
        channels: [channelId],
      });
      // Listen
      pubnubInstance.addListener({
        message: (event) => {
          console.log("New message received:", event.message);
        },
      });
    } catch (error) {
      console.error(`Failed to subscribe to channel ${channelId}:`, error);
    }
  }
  async function notifyNewMessage(payload) {
    try {
      const response = await notifyForNewMessage(payload);
    } catch (err) {
      console.error("Error notifyNewMessage:", err);
    }
  }

  async function handleNavigateBack() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); //stop both audio & video
    }
    navigate(`/add-webinar`);
  }

  return (
    <Box maxWidth="1400px" margin="auto" overflow="hidden">
      <Grid container spacing={0}>
        {/* Left: Video Section */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              position: "sticky",
              top: 0,
            }}
          >
            <Button
              onClick={handleNavigateBack}
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 550,
                fontSize: "13px",
                backgroundColor: "#719C40",
                borderRadius: "8px",
                color: "#FFFFFF",
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "#5e8535",
                  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              {"Back"}
            </Button>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            px={4}
            py={10}
            height="100%"
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontSize: "18px",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t("webinar.set_up_meeting_room")}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                px: 2,
              }}
            >
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
                sx={{
                  maxWidth: "352px",
                  fontSize: "14px",
                  fontWeight: 400,
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "46px",
                }}
              >
                {t("webinar.webinar_meeting_description")}
              </Typography>
            </Box>
            <Box
              component="video"
              ref={videoRef}
              autoPlay
              sx={{
                display: isVideoEnabled ? "block" : "none",
                width: "100%",
                maxHeight: "370px",
                objectFit: "cover",
                borderRadius: "16px",
              }}
            />
            <Box
              component="img"
              src={avatar}
              alt="Person"
              sx={{
                display: isVideoEnabled ? "none" : "block",
                width: "100%",
                maxHeight: "370px",
                objectFit: "cover",
                borderRadius: "16px",
              }}
              display
            />

            <Box textAlign="center" mt={3}>
              <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
                <IconButton
                  sx={{
                    border: "1px solid #E0E0E0",
                    borderRadius: "12px",
                    padding: "10px",
                  }}
                  onClick={() => {
                    toggleTrack("video");
                  }}
                >
                  {isVideoEnabled ? <VideocamOnIcon /> : <VideocamOffIcon />}
                </IconButton>
                <IconButton
                  sx={{
                    border: "1px solid #E0E0E0",
                    borderRadius: "12px",
                    padding: "10px",
                  }}
                  onClick={() => {
                    toggleTrack("audio");
                  }}
                >
                  {isAudioEnabled ? <MicOnIcon /> : <MicOffIcon />}
                </IconButton>
              </Stack>

              <Button
                variant="outlined"
                onClick={() => {
                  copyToClipboard();
                }}
                sx={{
                  marginTop: "20px",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "14px",
                  px: "16px",
                  py: "8px",
                  borderColor: "#D5D7DA",
                  color: "#414651",
                  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    borderColor: "#D5D7DA",
                    backgroundColor: "#f5f5f5",
                    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                {t("webinar.copy_invitation_link")}
              </Button>
            </Box>
            {/* <LiveCallIcon/> */}
          </Box>
        </Grid>

        {/* Vertical Divider */}
        <Grid
          item
          md={0.05}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <Divider orientation="vertical" flexItem />
        </Grid>

        {/* Right: Invitation Panel */}
        <Grid item xs={12} md={5.95}>
          <Box
            px={4}
            py={0}
            sx={{
              height: {
                xs: "auto", // No fixed height on mobile
                md: "90vh", // Fixed height on desktop
              },
              overflowY: {
                xs: "visible", // Allow content to expand normally on mobile
                md: "auto",
              },
              pr: 1,
            }}
          >
            <Stack spacing={2}>
              <Accordion
                defaultExpanded
                sx={{
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  m: 0,
                  p: 0,
                  "&::before": {
                    display: "none",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    m: 0,
                    p: 0,
                    minHeight: "auto",
                    "& .MuiAccordionSummary-content": {
                      margin: 0,
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontSize: "18px",
                      fontWeight: 550,
                      m: 0,
                      p: 0,
                    }}
                  >
                    {t("webinar.registered_users")}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container spacing={2}>
                    {registeredUsers?.map((user, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                          "@media (min-width:1200px)": {
                            flexBasis: "20%",
                            maxWidth: "20%", // 100 / 5 = 20%
                          },
                          "@media (max-width:1199.98px)": {
                            flexBasis: "33.3333%",
                            maxWidth: "33.3333%", // 100 / 3 = 33.33%
                          },
                        }}
                        key={index}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            width: "100%",
                            height: { xs: "100px", md: "110px" },
                            borderRadius: "12px",
                            p: 1,
                            textAlign: "center",
                            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                            border: "1px solid #D0D5DD",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Stack alignItems="center" spacing={1}>
                            <Avatar
                              src={user.avatar}
                              variant="square"
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "8px",
                              }}
                            />
                            <Typography
                              fontWeight={500}
                              sx={{
                                fontSize: "13px",
                                color: "#414651",
                                maxWidth: "80px",
                                overflow: "hidden",
                              }}
                            >
                              {user.firstName + " " + user.lastName}
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                {t("webinar.invite_your_teammates")}
              </Typography>

              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter teammate’s email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      height: 44,
                      fontSize: "14px",
                      color: "#344054",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon sx={{ color: "#667085" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={addMember}
                  disabled={selectedMembers.length === 0}
                  sx={{
                    height: 44,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                    borderColor: "#D5D7DA",
                    borderRadius: "8px",
                    color: "#414651",
                    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      borderColor: "#D5D7DA",
                      backgroundColor: "#f5f5f5",
                      boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  {t("webinar.add")}
                </Button>
              </Stack>
              {(searchQuery || selectedMembers.length > 0) && (
                <Box sx={{ mx: -2, overflowY: "auto", maxHeight: "30vh" }}>
                  <UserList
                    users={filteredUsers}
                    handleUserClick={selectMember}
                    isCheckBoxRequired={true}
                  />
                </Box>
              )}

              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: "Inter",
                  mb: 2,
                }}
              >
                {t("webinar.invited")} ({invitedMembers.length})
              </Typography>

              <Box
                sx={{
                  maxHeight: 240,
                  overflowY: "auto",
                  pr: 1,
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {invitedMembers.map((value, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={value.avatar}
                        sx={{ width: 50, height: 50 }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 15,
                          height: 15,
                          backgroundColor: "#2ECC71",
                          borderRadius: "50%",
                          border: "2px solid white",
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "14px",
                          fontFamily: "Inter",
                        }}
                      >
                        {value.label}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Box>

              <Stack
                direction="row"
                // spacing={3}
                mt={4}
                justifyContent="space-between"
                alignItems="center"
                sx={{ flexWrap: "wrap", rowGap: 2 }}
              >
                <Button
                  variant="outlined"
                  onClick={discardSelection}
                  sx={{
                    textTransform: "none",
                    fontWeight: 550,
                    fontSize: "13px",
                    borderColor: "#D5D7DA",
                    borderRadius: "8px",
                    color: "#414651",
                    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      borderColor: "#D5D7DA",
                      backgroundColor: "#f5f5f5",
                      boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  {t("webinar.discard")}
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    justifyContent: "flex-start",
                  }}
                >
                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      fontWeight: 550,
                      fontSize: "13px",
                      borderColor: "#D5D7DA",
                      borderRadius: "8px",
                      color: "#414651",
                      boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                      "&:hover": {
                        borderColor: "#D5D7DA",
                        backgroundColor: "#f5f5f5",
                        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                    onClick={sendInvites}
                  >
                    {t("webinar.send_invites")}
                  </Button>

                  <Button
                    onClick={() => {
                      navigate(`/webinar/meeting/${webinar?.callId}`);
                    }}
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 550,
                      fontSize: "13px",
                      backgroundColor: "#719C40",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                      boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                      "&:hover": {
                        backgroundColor: "#5e8535",
                        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    {t("webinar.start_meeting")}
                  </Button>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WebinarLiveCall;
