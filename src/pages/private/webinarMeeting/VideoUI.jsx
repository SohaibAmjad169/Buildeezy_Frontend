// webinarMeeting/VideoUI.jsx
import React from "react";
import { useCallStateHooks, ParticipantView } from "@stream-io/video-react-sdk";

const VideoUI = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
      {participants.map((p) => (
        <ParticipantView key={p.sessionId} participant={p} />
      ))}
    </div>
  );
};

export default VideoUI;
