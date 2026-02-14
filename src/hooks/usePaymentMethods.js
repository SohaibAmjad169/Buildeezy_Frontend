// hooks/usePaymentMethods.js
import { useState, useEffect } from 'react';
import { 
  getAdsPaymentMethods, 
  previewAdsPayment, 
  checkAdsPaymentStatus 
} from '../apis/apiEndPoints';

export const usePaymentMethods = (adData) => {
  const [paymentMethods, setPaymentMethods] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch payment methods and preview
  const fetchPaymentInfo = async () => {
    if (!adData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch available payment methods
      const methodsResponse = await getAdsPaymentMethods();
      setPaymentMethods(methodsResponse.data.data);

      // Fetch payment preview if we have ad details
      if (adData.professionalType && adData.startAt && adData.expireAt) {
        const previewResponse = await previewAdsPayment({
          professionalTypes: adData.professionalType,
          startDate: adData.startAt,
          endDate: adData.expireAt,
        });
        setPaymentPreview(previewResponse.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load payment information');
      console.error('Payment info fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if mobile money is available for user
  const hasMobileMoneySupport = () => {
    return paymentMethods?.paystack_mobile_money?.available || false;
  };

  // Get user's local currency info
  const getUserCurrencyInfo = () => {
    if (!paymentMethods?.userInfo) return null;
    
    return {
      country: paymentMethods.userInfo.country,
      currency: paymentMethods.userInfo.currency,
      phoneCode: paymentMethods.userInfo.phoneCode,
    };
  };

  // Get formatted payment amount for display
  const getFormattedAmount = () => {
    if (!paymentPreview) return null;
    
    const { local, usd } = paymentPreview;
    
    if (local.currency === 'USD') {
      return {
        display: `$${local.amount} USD`,
        breakdown: null,
      };
    }
    
    return {
      display: `${local.symbol}${local.amount} ${local.currency}`,
      breakdown: `≈ $${usd.amount} USD`,
      exchangeRate: `1 USD = ${local.rate} ${local.currency}`,
    };
  };

  // Get available payment methods as array for UI
  const getAvailableMethodsArray = () => {
    if (!paymentMethods) return [];
    
    const methods = [];
    
    if (paymentMethods.stripe?.available) {
      methods.push({
        id: 'stripe',
        name: paymentMethods.stripe.name,
        currency: paymentMethods.stripe.currency,
        type: 'card',
        recommended: paymentMethods.userInfo?.currency === 'USD',
      });
    }
    
    if (paymentMethods.paystack?.available) {
      methods.push({
        id: 'paystack',
        name: paymentMethods.paystack.name,
        currency: paymentMethods.paystack.currency,
        type: 'card_bank',
        recommended: false,
      });
    }
    
    if (paymentMethods.paystack_mobile_money?.available) {
      methods.push({
        id: 'paystack_mobile_money',
        name: paymentMethods.paystack_mobile_money.name,
        currency: paymentMethods.paystack_mobile_money.currency,
        type: 'mobile_money',
        providers: paymentMethods.paystack_mobile_money.providers,
        recommended: paymentMethods.userInfo?.currency !== 'USD',
      });
    }
    
    return methods;
  };

  useEffect(() => {
    fetchPaymentInfo();
  }, [adData]);

  return {
    paymentMethods,
    paymentPreview,
    loading,
    error,
    hasMobileMoneySupport,
    getUserCurrencyInfo,
    getFormattedAmount,
    getAvailableMethodsArray,
    refetchPaymentInfo: fetchPaymentInfo,
  };
};

// hooks/usePaymentStatus.js - For tracking payment status
export const usePaymentStatus = (adId, interval = 5000) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    if (!adId) return;
    
    setChecking(true);
    try {
      const response = await checkAdsPaymentStatus(adId);
      setPaymentStatus(response.data);
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setChecking(false);
    }
  };

  // Auto-check status for pending payments
  useEffect(() => {
    if (!adId) return;
    
    checkStatus(); // Initial check
    
    // Set up polling for pending payments
    const pollInterval = setInterval(() => {
      if (paymentStatus?.paymentStatus === 'pending') {
        checkStatus();
      }
    }, interval);

    return () => clearInterval(pollInterval);
  }, [adId, paymentStatus?.paymentStatus, interval]);

  return {
    paymentStatus: paymentStatus?.paymentStatus,
    paymentData: paymentStatus?.paymentData,
    checking,
    manualCheck: checkStatus,
  };
};