import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import { Download, PhoneAndroid, Apple } from '@mui/icons-material';
import { isStandalone, isMobile, getPlatform } from '../../utils/mobileUtils';

const InstallPWAButton = ({ variant = 'contained', size = 'medium', sx = {} }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (isStandalone()) {
      setCanInstall(false);
      return;
    }

    // Check platform
    const platform = getPlatform();
    const userAgent = navigator.userAgent.toLowerCase();
    
    setIsIOS(platform === 'ios' || /iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(platform === 'android' || /android/.test(userAgent));

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
      console.log('PWA was installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if we can show install prompt
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
        setCanInstall(false);
        window.deferredPrompt = null;
      });
    } else if (isIOS || isAndroid) {
      // Show manual installation instructions
      setShowInstallDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowInstallDialog(false);
  };

  // Don't show button if app is already installed or can't be installed
  if (isStandalone() || (!canInstall && !isIOS && !isAndroid)) {
    return null;
  }

  const getInstallText = () => {
    if (isMobile()) {
      return 'Install App';
    }
    return 'Install Buildeezy';
  };

  const getIcon = () => {
    if (isIOS) return <Apple />;
    if (isAndroid) return <PhoneAndroid />;
    return <Download />;
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={getIcon()}
        onClick={handleInstallClick}
        sx={{
          bgcolor: '#719c40',
          color: 'white',
          '&:hover': {
            bgcolor: '#5a7d33',
          },
          ...sx,
        }}
      >
        {getInstallText()}
      </Button>

      {/* Manual installation dialog for iOS/Android */}
      <Dialog
        open={showInstallDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          Install Buildeezy App
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box sx={{ fontSize: 48, mb: 2 }}>
              {isIOS ? '📱' : '🤖'}
            </Box>
            <Typography variant="h6" gutterBottom>
              Get the full app experience!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Install Buildeezy on your device for faster access, offline functionality, and push notifications.
            </Typography>
          </Box>

          {isIOS && (
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                To install on iOS:
              </Typography>
              <Box component="ol" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" gutterBottom>
                  Tap the <strong>Share</strong> button <span style={{ fontSize: '16px' }}>📤</span> at the bottom of your screen
                </Typography>
                <Typography component="li" variant="body2" gutterBottom>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </Typography>
                <Typography component="li" variant="body2" gutterBottom>
                  Tap <strong>"Add"</strong> in the top right corner
                </Typography>
                <Typography component="li" variant="body2">
                  The Buildeezy app will appear on your home screen!
                </Typography>
              </Box>
            </Box>
          )}

          {isAndroid && (
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                To install on Android:
              </Typography>
              <Box component="ol" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" gutterBottom>
                  Tap the <strong>menu</strong> button (⋮) in your browser
                </Typography>
                <Typography component="li" variant="body2" gutterBottom>
                  Look for <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>
                </Typography>
                <Typography component="li" variant="body2" gutterBottom>
                  Tap <strong>"Install"</strong> or <strong>"Add"</strong>
                </Typography>
                <Typography component="li" variant="body2">
                  The Buildeezy app will appear on your home screen!
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Benefits of installing:</strong> Faster loading, offline access, push notifications, and native app experience.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstallPWAButton;