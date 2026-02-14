import {
    LoadingIndicator,
    ReactionsButton,
    RecordingInProgressNotification,
    useCall,
    useCallStateHooks,
    useParticipantViewContext,
} from "@stream-io/video-react-sdk";
import { useCallback, useEffect, useState } from "react";
import CallEndIcon from '@mui/icons-material/CallEnd';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { IconButton, Menu, MenuItem, Tooltip, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

export const CustomRecordCallButton = () => {
    const call = useCall();
    const { useIsCallRecordingInProgress } = useCallStateHooks();
    const isCallRecordingInProgress = useIsCallRecordingInProgress();
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
    const isSmallScreen = useMediaQuery("(max-width:500px)");

    useEffect(() => {
        setIsAwaitingResponse((awaiting) => awaiting ? false : awaiting);
    }, [isCallRecordingInProgress]);

    const toggleRecording = useCallback(async () => {
        try {
            setIsAwaitingResponse(true);
            if (isCallRecordingInProgress) {
                await call?.stopRecording();
            } else {
                await call?.startRecording();
            }
        } catch (e) {
            console.error("Failed to toggle recording", e);
        }
    }, [call, isCallRecordingInProgress]);


    return isAwaitingResponse ? (
        <IconButton>
            <LoadingIndicator
                tooltip={
                    isCallRecordingInProgress
                        ? "Waiting for recording to stop..."
                        : "Waiting for recording to start..."
                }
            />
        </IconButton>
    ) :
        isSmallScreen ? (
            <MenuItem disabled={!call} onClick={toggleRecording}>
                {isCallRecordingInProgress ? (
                    <CropSquareIcon fontSize="small" sx={{ color: "black", mr: 1 }} />
                ) : (
                    <RadioButtonUncheckedIcon fontSize="small" sx={{ color: "black", mr: 1 }} />
                )}
                {isCallRecordingInProgress ? "Stop Recording" : "Start Recording"}
            </MenuItem>
        ) : (
            <RecordingInProgressNotification>
                <Tooltip title={isCallRecordingInProgress ? "Stop Recording" : "Start Recording"}
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
                        disabled={!call}
                        onClick={toggleRecording}
                        sx={{
                            bgcolor: "#709A1C",
                            p: "9px",
                            "&:hover": { bgcolor: "#4E6B13" },
                        }}
                    >
                        {isCallRecordingInProgress ? (
                            <CropSquareIcon fontSize="small" sx={{ color: "white" }} />
                        ) : (
                            <RadioButtonUncheckedIcon fontSize="small" sx={{ color: "white" }} />
                        )}
                    </IconButton>
                </Tooltip>
            </RecordingInProgressNotification>
        );
};

export const CustomScreenShareButton = () => {
    const call = useCall();

    const { useScreenShareState, useHasOngoingScreenShare } = useCallStateHooks();
    const { screenShare, isMute: isScreenSharing } = useScreenShareState();
    const isSomeoneScreenSharing = useHasOngoingScreenShare();

    return (
        <Tooltip title="Share Screen"
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
                disabled={!call}
                onClick={() => screenShare.toggle()}
                sx={{
                    bgcolor: "#709A1C",
                    p: "9px",
                    "&:hover": { bgcolor: "#4E6B13" },
                }}
            >
                {isScreenSharing ? (
                    <ScreenShareIcon fontSize="small" sx={{ color: "white" }} />
                ) : (
                    <StopScreenShareIcon fontSize="small" sx={{ color: "white" }} />
                )}
            </IconButton>
        </Tooltip>
    );
};

export const CustomReactionButton = () => {
    return (
        <Tooltip title="Send Reaction"
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
            <IconButton sx={{
                p: 0
            }}>
                <ReactionsButton />
            </IconButton>
        </Tooltip>
    );
};

export const CustomToggleVideoPublishingButton = () => {
    const { useCameraState } = useCallStateHooks();
    const { camera, isMute } = useCameraState();

    return (
        <Tooltip title="Toggle Video"
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
                onClick={() => camera.toggle()}
                sx={{
                    bgcolor: "#709A1C",
                    p: "9px",
                    "&:hover": { bgcolor: "#4E6B13" },
                }}
            >
                {isMute ? (
                    <VideocamOffIcon fontSize="small" sx={{ color: "white" }} />
                ) : (
                    <VideocamIcon fontSize="small" sx={{ color: "white" }} />
                )}
            </IconButton>
        </Tooltip>

    );
};

export const CustomToggleAudioPublishingButton = () => {
    const { useMicrophoneState } = useCallStateHooks();
    const { microphone, isMute } = useMicrophoneState();

    return (
        <Tooltip title="Toggle Microphone"
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
                onClick={() => microphone.toggle()}
                sx={{
                    bgcolor: "#709A1C",
                    p: "9px",
                    "&:hover": { bgcolor: "#4E6B13" },
                }}
            >
                {isMute ? (
                    <MicOffIcon fontSize="small" sx={{ color: "white" }} />
                ) : (
                    <MicIcon fontSize="small" sx={{ color: "white" }} />
                )}
            </IconButton>
        </Tooltip>
    );
};

export const CustomCancelCallButton = () => {
    const call = useCall();
    const navigate = useNavigate()
    const isSmallScreen = useMediaQuery("(max-width:500px)");

    const handleLeave = async () => {
        try {
            await call?.leave({ reject: false }); // or pass reject as needed
        } catch (err) {
            console.error("Failed to leave the call:", err);
        } finally {
            navigate("/webinar/start-live-call");
        }
    };


    return isSmallScreen ? (
        <MenuItem onClick={handleLeave}>
            <CallEndIcon sx={{ mr: 1, color: "#D32F2F" }} fontSize="small" />
            End Call
        </MenuItem>
    ) : (
        <Tooltip title="End Call"
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
                onClick={handleLeave}
                sx={{
                    bgcolor: "#D32F2F",
                    color: "white",
                    p: "9px",
                    "&:hover": {
                        bgcolor: "#B71C1C",
                    },
                }}
            >
                <CallEndIcon fontSize="small" sx={{ color: "white" }} />
            </IconButton>
        </Tooltip>
    );
};

