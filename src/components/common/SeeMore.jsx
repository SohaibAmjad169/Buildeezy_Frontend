import { Box, Divider } from "@mui/material";
import ActionButton from "./ActionButton";
import Loading from "./Loading";
import { t } from "i18next";

function SeeMore({ handleSeeMore, isShow, isLoading }) {
  if (isLoading) {
    return <Loading />;
  }
  return isShow ? (
    <Box
      sx={{
        textAlign: "center",
      }}
    >
      <Divider sx={{ my: 2 }} />
      <ActionButton
        variant="outlined"
        // color="greyButton"
        onClick={handleSeeMore}
      >
        {t("profile.preview.see_more")}
      </ActionButton>
    </Box>
  ) : (
    <></>
  );
}
export default SeeMore;
