import { Box, Typography, Button, Container, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { useNavigate } from 'react-router-dom';

const WebinarSuccess = () => {
  const navigate = useNavigate();
 
  const handleGoToWebinar = () => {
    navigate('/add-webinar');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 10,
          p: 5,
          boxShadow: 6,
          borderRadius: 3,
          backgroundColor: '#ffffff',
          textAlign: 'center',
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#4caf50' }} />
        <Typography variant="h4" fontWeight="bold" mt={2} gutterBottom>
          Payment Successful! 🎉
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Thank you for your payment. Your spot in the webinar is secured. We can’t wait to see you there! 👋
        </Typography>
        <Stack direction="row" justifyContent="center" spacing={1} alignItems="center" mb={3}>
          <CelebrationIcon sx={{ color: '#ff9800' }} />
          <Typography variant="body2" fontStyle="italic" color="text.secondary">
            Let’s get started!
          </Typography>
        </Stack>
        <Button
          onClick={handleGoToWebinar}
          variant="contained"
          sx={{
            backgroundColor: '#779F26',
            color: '#ffffff',
            px: 4,
            py: 1.5,
            fontWeight: 'bold',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#678c20',
            },
          }}
        >
          Go to Webinar Page
        </Button>
      </Box>
    </Container>
  );
};

export default WebinarSuccess;
