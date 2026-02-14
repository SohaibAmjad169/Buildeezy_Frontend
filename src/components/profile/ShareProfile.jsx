import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const ShareProfile = ({ open, onClose, profileData, completionPercentage = 0 }) => {
  const [copied, setCopied] = useState(false);
  const { profileData: currentProfileData } = useSelector((state) => state.profile);
  
  // Use profileData prop or fallback to current profile data
  const profile = profileData || currentProfileData;
  
  // Generate profile share URL
  const profileUrl = `${window.location.origin}/dashboard/view/${profile?.id}/profile`;
  
  // Profile share content
  const shareText = `Check out ${profile?.firstName} ${profile?.lastName}'s professional profile`;
  const shareContent = `${shareText} - ${profileUrl}`;

  const trackShareAttempt = () => {
    // Record sharing attempt in localStorage
    const currentTime = new Date().getTime();
    localStorage.setItem('profileShareAttempt', currentTime.toString());
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShareAttempt(); // Track copy attempt
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareContent)}`;
    window.open(whatsappUrl, '_blank');
    trackShareAttempt(); // Track WhatsApp share attempt
  };

  const handleEmailShare = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareContent)}`;
    window.location.href = emailUrl;
    trackShareAttempt(); // Track email share attempt
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedInUrl, '_blank');
    trackShareAttempt(); // Track LinkedIn share attempt
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
    window.open(facebookUrl, '_blank');
    trackShareAttempt(); // Track Facebook share attempt
  };

  const getUserTypeLabel = (userType) => {
    const labels = {
      'vendor': 'Vendor',
      'contractor': 'Contractor', 
      'specialist': 'Specialist',
      'client': 'Client'
    };
    return labels[userType] || userType;
  };

  if (!profile) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShareIcon color="primary" />
          <Typography variant="h6">Share Profile</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Profile Preview Card */}
        <Card sx={{ mb: 3, border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={profile.avatar}
              alt={`${profile.firstName} ${profile.lastName}`}
              sx={{ width: 64, height: 64 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Chip 
                label={getUserTypeLabel(profile.userType)}
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ mb: 1 }}
              />
              {profile.country?.name && (
                <Typography variant="body2" color="text.secondary">
                  📍 {profile.city?.name ? `${profile.city.name}, ` : ''}{profile.country.name}
                </Typography>
              )}
              {completionPercentage > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`${completionPercentage}% Complete Profile`}
                    size="small"
                    color={completionPercentage >= 80 ? 'success' : completionPercentage >= 50 ? 'warning' : 'error'}
                    variant="filled"
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Copy Link Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Profile Link
          </Typography>
          <TextField
            fullWidth
            value={profileUrl}
            variant="outlined"
            size="small"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                    <IconButton onClick={handleCopyLink} size="small">
                      <CopyIcon color={copied ? 'success' : 'default'} />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-input': {
                fontSize: '0.875rem',
                color: 'text.secondary'
              }
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Share Options */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Share via
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<WhatsAppIcon />}
              onClick={handleWhatsAppShare}
              sx={{ 
                flex: 1, 
                minWidth: 120,
                color: '#25D366',
                borderColor: '#25D366',
                '&:hover': { backgroundColor: 'rgba(37, 211, 102, 0.04)' }
              }}
            >
              WhatsApp
            </Button>
            <Button
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={handleEmailShare}
              sx={{ 
                flex: 1, 
                minWidth: 120,
                color: '#EA4335',
                borderColor: '#EA4335',
                '&:hover': { backgroundColor: 'rgba(234, 67, 53, 0.04)' }
              }}
            >
              Email
            </Button>
            <Button
              variant="outlined"
              startIcon={<LinkedInIcon />}
              onClick={handleLinkedInShare}
              sx={{ 
                flex: 1, 
                minWidth: 120,
                color: '#0077B5',
                borderColor: '#0077B5',
                '&:hover': { backgroundColor: 'rgba(0, 119, 181, 0.04)' }
              }}
            >
              LinkedIn
            </Button>
            <Button
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={handleFacebookShare}
              sx={{ 
                flex: 1, 
                minWidth: 120,
                color: '#1877F2',
                borderColor: '#1877F2',
                '&:hover': { backgroundColor: 'rgba(24, 119, 242, 0.04)' }
              }}
            >
              Facebook
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="contained" fullWidth>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareProfile;