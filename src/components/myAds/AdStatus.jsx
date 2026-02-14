import { Box, Chip } from "@mui/material";
function AdStatus({ reason }) {
  if (!!reason && Object.keys(reason).length > 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mr: 2 }}>
        {Object.keys(reason).map((key) => (
          <Chip
            key={key}
            label={reason[key].reason}
            color="error"
            variant="outlined"
            size="small"
          />
        ))}
      </Box>
    );
  }
  return <></>;
}
export default AdStatus;
