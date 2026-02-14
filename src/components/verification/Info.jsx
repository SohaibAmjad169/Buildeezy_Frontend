import { useState } from "react";
import { Box, Popover } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MuiTypography from "../common/MuiTypography";
import { useSelector } from "react-redux";
import { isObject } from "lodash";

function Info({ data }) {
  const { profileData } = useSelector((state) => state.profile);

  const userType = profileData.userType;
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return (
    <>
      <InfoOutlinedIcon
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        sx={{ mr: 1, color: "disabledColor" }}
      />

      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
          "& .MuiPaper-root": {
            width: 400,
          },
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <MuiTypography variant="subtitle1" sx={{ pr: 1.5, py: 1 }}>
          {isObject(data) ? (
            <span dangerouslySetInnerHTML={{ __html: data[userType] }} />
          ) : (
            <Box sx={{ ml: 1.5, textAlign: "justify" }}>{data}</Box>
          )}
        </MuiTypography>
      </Popover>
    </>
  );
}
export default Info;
