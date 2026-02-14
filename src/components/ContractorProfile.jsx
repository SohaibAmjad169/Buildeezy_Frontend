import { useParams } from "react-router-dom";
import { Container, Box } from "@mui/material";
import ViewUserProfile from "./previewProfileDetails/ViewUserProfile";

function ContractorProfile({ userId: propUserId }) {
  const { id: paramUserId } = useParams();
  const userId = propUserId || paramUserId;
  return (
    <Container
      disableGutters
      sx={{
        width: { xs: "100%", md: "100%", lg: "70%" },
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      <Box sx={{ py: 2 }}>
        <ViewUserProfile userId={userId} />
      </Box>
    </Container>
  );
}

export default ContractorProfile;
