import React from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { t } from "i18next";

export default function PortfolioImageDialog({ open, image, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          boxShadow: "none",
          borderRadius: 3,
          background: "transparent",
          m: 0,
          overflow: "visible",
          p: 0,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 0,
          minHeight: 0,
          p: 0,
        }}
      >
        {image && (
          <img
            src={image}
            alt="Portfolio Full Size"
            style={{
              maxWidth: "135vw",
              maxHeight: "120vh",
              width: "100%",
              height: "auto",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
            }}
          />
        )}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              background: "#709a1c",
              color: "#fff",
              fontWeight: 600,
              px: 2,
              py: 1,
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": {
                background: "#709a1c",
                color: "#fff",
                boxShadow: "none",
              },
            }}
          >
            {t("common.close")}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
