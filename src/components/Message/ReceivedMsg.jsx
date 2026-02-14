import { Box, Stack } from "@mui/material";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";
import { useRef, useEffect } from "react";
import Linkify from "linkify-react";

import MuiTypography from "../common/MuiTypography";
import { colors } from "../../styles/theme";
import { convertDateTime } from "../../utils/common";
import SingleSkeleton from "../skeleton/SingleSkeleton";
import ChatAvatar from "../common/ChatAvatar";
import { getAvatarName } from "../../utils/common";
import { alpha } from "@mui/material";
import { setChannelsLastSeen } from "../../redux/pubnubSlice";

function ReceivedMsg({ sender, msg, time, avatar, channelId }) {
  const dispatch = useDispatch();
  const messageRef = useRef(null);
  const { msgLoading, channelsLastSeen } = useSelector((state) => state.pubnub);
  const [firstName, lastName] = sender ? sender.split(" ") : ["", ""];
  useEffect(() => {
    if (!messageRef.current || !time) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const currentLastSeen = channelsLastSeen[channelId] || 0;
          const messageTimeToken = time;
          
          // If this message's time token is greater than the current lastSeen value,
          // update the lastSeen value
          if (messageTimeToken > currentLastSeen) {
            dispatch(setChannelsLastSeen({
              channelId,
              lastSeen: messageTimeToken
            }));
          }
        }
      },
      {
        threshold: 0.5, // Message is considered visible when 50% is in view
        rootMargin: '0px'
      }
    );

    observer.observe(messageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [time, channelId, channelsLastSeen, dispatch]);

  return (
    <Stack direction={"row"} alignItems={"start"} spacing={1} px={2.5} py={1} ref={messageRef}>
      <ChatAvatar src={avatar} alt={sender} sx={{ width: 46, height: 46 }}>
        {getAvatarName(firstName, lastName)}
      </ChatAvatar>

      <Stack maxWidth={"70%"} minWidth={"30%"} alignSelf={"flex-start"}>
        {msgLoading ? (
          <SingleSkeleton />
        ) : (
          <>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              spacing={1}
            >
              <MuiTypography variant="h6">{sender}</MuiTypography>
              <MuiTypography variant="subtitle2">
                {convertDateTime(dayjs(time))}
              </MuiTypography>
            </Stack>
            <Box
              sx={(theme) => ({
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(colors.grey300, 0.1)
                    : colors.grey100,
                border: "solid 1px",
                borderColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.divider
                    : "uploadBorder",
                borderRadius: "0 8px 8px 8px",
                p: 1.5,
                mt: 1,
              })}
            >
              <Linkify>
                <MuiTypography
                  variant="h4"
                  sx={{
                    whiteSpace: "break-spaces",
                    lineBreak: "anywhere",
                  }}
                >
                  {msg}
                </MuiTypography>
              </Linkify>
            </Box>
          </>
        )}
      </Stack>
    </Stack>
  );
}

export default ReceivedMsg;
