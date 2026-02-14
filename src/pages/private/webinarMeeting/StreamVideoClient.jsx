// webinarMeeting/StreamVideoClient.jsx
import React from "react";
import { StreamVideo } from "@stream-io/video-react-sdk";
import { client } from "./streamClient";

const StreamVideoClient = ({ children }) => {
  return <StreamVideo client={client}>{children}</StreamVideo>;
};

export default StreamVideoClient;
