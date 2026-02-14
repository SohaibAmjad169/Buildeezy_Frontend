/**
 * Facebook Authentication Service
 * Provides methods for initializing the Facebook SDK and handling login
 */

// Initialize the Facebook SDK
export function initFacebookSdk(appId) {
  return new Promise((resolve) => {
    // Wait for the Facebook SDK to be loaded
    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      });
      
      resolve();
    };
    
    // If FB SDK is already loaded, initialize immediately
    if (window.FB) {
      window.fbAsyncInit();
    }
  });
}

// Login with Facebook
export function loginWithFacebook() {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('Facebook SDK not loaded'));
      return;
    }
    
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          // Get user data
          window.FB.api(
            '/me',
            { fields: 'id,name,email,picture' },
            (userData) => {
              // Make sure email is present
              if (!userData.email) {
                console.warn('Facebook did not return an email address');
              }
              
              const result = {
                ...userData,
                accessToken: response.authResponse.accessToken,
              };
              resolve(result);
            }
          );
        } else {
          reject(new Error('User cancelled login or did not fully authorize'));
        }
      },
      { scope: 'email,public_profile', display: 'dialog' }
    );
  });
}
