import { Box, Stack } from "@mui/material";
import Linkify from "linkify-react";
import { t } from "i18next";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

import { convertDateTime } from "../../utils/common";
import MuiTypography from "../common/MuiTypography";
import { colors } from "../../styles/theme";
import SingleSkeleton from "../skeleton/SingleSkeleton";

function SentMsg({ msg, time }) {
  const { msgLoading } = useSelector((state) => state.pubnub);
  return (
    <Stack
      maxWidth={"70%"}
      minWidth={"30%"}
      alignSelf={"flex-end"}
      sx={{
        ml: "auto",
        px: 2.5,
        py: 1,
      }}
    >
      {msgLoading ? (
        <SingleSkeleton />
      ) : (
        <>
          <Stack direction={"row"} justifyContent={"space-between"} spacing={1}>
            <MuiTypography variant="h6">{t("message.you")}</MuiTypography>
            <MuiTypography variant="subtitle2">
              {convertDateTime(dayjs(time))}
            </MuiTypography>
          </Stack>
          <Box
            sx={{
              backgroundColor: colors.primary,
              border: "solid 1px",
              borderColor: "primary.main",
              borderRadius: "8px 0 8px 8px",
              p: 1.5,
              mt: 1,
            }}
          >
            <Linkify>
              <MuiTypography
                variant="h4"
                sx={{
                  color: colors.white,
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
  );
}

export default SentMsg;
