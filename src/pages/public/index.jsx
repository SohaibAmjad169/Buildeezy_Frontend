import { useState, useCallback, useEffect, Suspense } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@emotion/react";
import "./styles.scss";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import loginCoverImg from "../../assets/images/cover.webp";
import loginCoverImgSm from "../../assets/images/cover_sm.webp";
import loginCoverThumb from "../../assets/images/cover_thumb.webp";
import AppLogo from "../../components/common/AppLogo";
import FallbackSpinner from "../../components/common/FallbackSpinner";

function PublicPages() {
  const theme = useTheme();
  const smDevices = useMediaQuery(theme.breakpoints.down("lg"));
  const { showLogoLeft } = useSelector((state) => state.config);
  const [loginCover, setLoginCover] = useState(loginCoverThumb);

  const preLoadImage = useCallback(async (src) => {
    const imgPromise = await new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(src);
      img.onerror = () => reject("");
    });
    setLoginCover(imgPromise ?? loginCoverThumb);
  }, []);

  useEffect(() => {
    preLoadImage(smDevices ? loginCoverImgSm : loginCoverImg);
  }, [preLoadImage, smDevices]);

  return (
    <Suspense fallback={<FallbackSpinner />}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: "100vh",
          overflowX: "hidden",
          overflowY: { xs: "scroll", md: "hidden" },
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: "42%", lg: "35.15%" },
            mb: { xs: 3 },
          }}
        >
          <Box
            component="img"
            sx={{
              width: "100%",
              height: { xs: "45vh", md: "100vh" },
              objectFit: "cover",
            }}
            src={loginCover}
            alt="cover-page"
          />
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: "58%", lg: "64.85%" },
            height: { md: "100vh" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: { xs: "16px", md: 0 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              maxHeight: { md: "100vh" },
              overflowY: { xs: "hidden", md: "auto" },
              overflowX: "hidden",
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "60%", md: "70%", lg: "52.1%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                my: { xs: 0, md: 2 },
              }}
            >
              <Box
                sx={{
                  ...(showLogoLeft && {
                    mr: "auto",
                  }),
                }}
              >
                <AppLogo />
              </Box>
              <Box sx={{ width: "100%" }}>
                <Outlet />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Suspense>
  );
}

export default PublicPages;
