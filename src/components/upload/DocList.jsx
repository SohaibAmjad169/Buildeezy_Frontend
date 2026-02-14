import { useState, Fragment } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

import MuiTypography from "../common/MuiTypography";
import {
  getDocIcon,
  getFileFormat,
  getFileName,
  getFileType,
} from "../../utils/file";
import DocumentViewer from "./DocumentViewer";
import VideoThumb from "../common/VideoThumb";
import { Swiper, SwiperSlide } from "swiper/react";
import buildeezyPlaceholder from "../../assets/images/buildeezy-placeholder.png";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { colors } from "../../styles/theme";


const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function DocList({ documents, isMobile, isLearningAd = false }) {
  const { t } = useTranslation();

  const initialSrc = documents?.[0]
    ? documents[0].includes("https:")
      ? documents[0]
      : IMAGE_URL + documents[0]
    : buildeezyPlaceholder;

  const [imgSrc, setImgSrc] = useState(initialSrc);


  const [open, setOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  function onViewerOpen(file) {
    setCurrentFile(file);
    setOpen(true);
  }
  function onCloseViewer() {
    setCurrentFile(null);
    setOpen(false);
  }

  const docWidth = isMobile ? 145 : 290;
  const docHeight = isMobile ? 90 : 180;

  return (
    <>
      {documents?.length > 0 ? (
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          navigation={true}
          centeredSlides={false}
          slidesPerView="auto"
          loop={true}
          style={{
            width: "auto",
            height: "auto",
            padding: "8px 0",
            "--swiper-navigation-color": colors.grey400,
            "--swiper-navigation-size": "24px",
          }}
        >
          {documents.map((file, i) => (
            <SwiperSlide
              key={"ad_" + i}
              style={{
                width: docWidth,
                // marginRight: isMobile ? "8px" : "16px",
                flexShrink: 0,
              }}
            >
              <Fragment key={i}>
                {getFileType(file) === "image" ? (
                  <Box
                    key={`${file}_${i}`}
                    component="img"
                    src={file.includes("https:") ? file : IMAGE_URL + file}
                    // src={imgSrc}
                    onError={() => setImgSrc(buildeezyPlaceholder)}
                    alt="Additional Document"
                    onClick={() => onViewerOpen(file)}
                    sx={{
                      objectFit: "cover",
                      height: docHeight,
                      width: docWidth,
                      borderRadius: { xs: "8px", md: "12px" },
                      bgcolor: "paginationBg",
                      cursor: "pointer",
                      display: "block"
                    }}
                  />
                ) : getFileType(file) === "video" ? (
                  <VideoThumb
                    videoUrl={file.includes("https:") ? file : IMAGE_URL + file}
                    onClick={() => onViewerOpen(file)}
                    height={docHeight}
                    width={docWidth}
                    isLearningAd={isLearningAd}
                    sx={{
                      borderRadius: { xs: "8px", md: "12px" },
                      cursor: "pointer",
                    }}
                  />
                ) : (
                  <Box
                    key={`${file}_${i}`}
                    onClick={() => onViewerOpen(file)}
                    sx={{
                      placeItems: "center",
                      display: "grid",
                      height: docHeight,
                      width: docWidth,
                      borderRadius: { xs: "8px", md: "12px" },
                      bgcolor: "paginationBg",
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      component="img"
                      src={getDocIcon(file)}
                      alt="file"
                      sx={{
                        height: isMobile ? 25 : 35,
                        width: isMobile ? 25 : 35,
                        mr: 1.5,
                      }}
                    />
                  </Box>
                )}
              </Fragment>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <MuiTypography variant="subtitle2">
          {t("job.details.no_documents")}
        </MuiTypography>
      )}

      {currentFile && open && (
        <DocumentViewer
          open={open}
          handleClose={onCloseViewer}
          type={getFileFormat(currentFile)}
          name={getFileName(currentFile)}
          path={
            currentFile.includes("https:")
              ? currentFile
              : IMAGE_URL + currentFile
          }
        />

      )}
    </>
  );
}

DocList.propTypes = {
  documents: PropTypes.array,
  isMobile: PropTypes.bool,
  isLearningAd: PropTypes.bool,
};

export default DocList;
