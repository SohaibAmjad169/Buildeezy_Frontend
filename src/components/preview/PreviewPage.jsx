import { Box, Container } from "@mui/material";
import PreviewContainer from "./PreviewContainer";

function PreviewPage({ data, onExitPreview }) {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Box sx={{ py: 2 }}>
        <PreviewContainer data={data} onExitPreview={onExitPreview} />
      </Box>
    </Container>
  );
}

export default PreviewPage;
