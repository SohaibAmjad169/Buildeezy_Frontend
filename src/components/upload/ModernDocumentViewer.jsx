import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography, CircularProgress } from "@mui/material";
import ReactPlayer from "react-player";

const IMAGE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

function ModernDocumentViewer({ type, name, path }) {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fullPath = path.includes("https:") ? path : IMAGE_URL + path;

  // Reset state when document changes
  // useEffect(() => {
  //   setLoading(true);
  //   setError(null);
  // }, [path]);
  
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Minimum loader time
    const delay = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 seconds

    return () => clearTimeout(delay);
  }, [path]);

  // Handle image load
  const onImageLoad = () => {
    setLoading(false);
  };

  // Handle image error
  const onImageError = () => {
    setError("Failed to load image");
    setLoading(false);
  };

  // Handle iframe load
  const onIframeLoad = () => {
    // setLoading(false);
  };

  // Handle iframe error
  const onIframeError = () => {
    setError("Failed to load document");
    // setLoading(false);
  };

  // Render based on file type
  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="500px"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="500px"
        >
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    // Video files
    if (type === "video" || path.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <ReactPlayer url={fullPath} controls width="100%" height="320px" />
      );
    }

    // PDF files
    if (type === "application/pdf" || path.match(/\.pdf$/i) || type === "pdf") {
      return (
        <Box sx={{ width: "100%", height: "500px" }}>
          <iframe
            src={fullPath}
            width="100%"
            height="100%"
            title={name}
            onLoad={onIframeLoad}
            onError={onIframeError}
            style={{ border: "none" }}
          />
        </Box>
      );
    }

    // Image files
    if (
      type.startsWith("image/") ||
      path.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img
            src={fullPath}
            alt={name}
            style={{ maxWidth: "100%", maxHeight: "500px" }}
            onLoad={onImageLoad}
            onError={onImageError}
          />
        </Box>
      );
    }

    // Text files
    if (
      type.startsWith("text/") ||
      path.match(/\.(txt|md|json|js|css|html)$/i)
    ) {
      return (
        <Box
          sx={{
            width: "100%",
            height: "500px",
            overflow: "auto",
            p: 2,
            bgcolor: "#f5f5f5",
            borderRadius: 1,
          }}
        >
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            <TextFileViewer
              url={fullPath}
              onLoad={() => setLoading(false)}
              onError={() => setError("Failed to load text file")}
            />
          </pre>
        </Box>
      );
    }

    // Default fallback
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="500px"
      >
        <Typography>Unsupported file type: {type}</Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", height: "100%", p: 2 }}>{renderContent()}</Box>
  );
}

// Text file viewer component
function TextFileViewer({ url, onLoad, onError }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch text file");
        const text = await response.text();
        setContent(text);
        onLoad();
      } catch (error) {
        console.error("Error loading text file:", error);
        onError();
      }
    };

    fetchText();
  }, [url, onLoad, onError]);

  return <>{content}</>;
}

TextFileViewer.propTypes = {
  url: PropTypes.string.isRequired,
  onLoad: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

ModernDocumentViewer.propTypes = {
  type: PropTypes.any,
  name: PropTypes.any,
  path: PropTypes.string,
};

export default ModernDocumentViewer;
