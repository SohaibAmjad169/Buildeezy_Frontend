// useAccountsCards.js - Fixed hook without userType restrictions

import { useMemo, useState, useEffect } from 'react';
import { AccountBalance, CreditCard, Phone } from '@mui/icons-material';
import { getStartButtonPayoutSettingsUrl, getStartButtonWalletBalance } from '../apis/apiEndPoints';

const useAccountsCards = (profileData) => {
  const [startButtonEnabled, setStartButtonEnabled] = useState(false);
  const [startButtonBalances, setStartButtonBalances] = useState([]);
  const [loadingStartButton, setLoadingStartButton] = useState(true);

  // Check StartButton status for ALL users (removed userType restriction)
  useEffect(() => {
    const checkStartButtonStatus = async () => {
      try {
        const [settingsResponse, balanceResponse] = await Promise.all([
          getStartButtonPayoutSettingsUrl().catch(() => null),
          getStartButtonWalletBalance().catch(() => null)
        ]);
        
        const enabled = settingsResponse?.data?.data?.enabled || false;
        setStartButtonEnabled(enabled);
        
        if (balanceResponse?.data?.success) {
          const balances = balanceResponse.data.data || [];
          setStartButtonBalances(balances);
        }
      } catch (error) {
        console.error('Error checking StartButton status:', error);
      }
      setLoadingStartButton(false);
    };

    if (profileData) {
      checkStartButtonStatus();
    }
  }, [profileData]);

  const cards = useMemo(() => {
    const baseCards = [];

    // International account cards - Available for ALL users
    baseCards.push({
      id: 'international_setup',
      btn: 'setup_international_account',
      title: 'Setup International Account',
      mediaIcon: <AccountBalance />,
      isDisabled: false
    });

    baseCards.push({
      id: 'international_manage',
      btn: 'manage_international_account', 
      title: 'Manage International Account',
      mediaIcon: <CreditCard />,
      isDisabled: false
    });

    // Local account card (StartButton) - Available for ALL users
    const totalBalance = startButtonBalances.reduce((sum, balance) => 
      sum + (balance.availableBalance || 0), 0
    );
    const hasBalance = totalBalance > 0;
    const isSetupNeeded = !startButtonEnabled;
    
    // Determine card title based on state
    let localCardTitle = 'Setup Local Account';
    if (startButtonEnabled) {
      if (hasBalance) {
        // Show abbreviated total balance
        const mainCurrency = startButtonBalances[0]?.currency || 'USD';
        localCardTitle = `Local Account (${formatBalance(totalBalance, mainCurrency)})`;
      } else {
        localCardTitle = 'Manage Local Account';
      }
    }
    
    baseCards.push({
      id: 'local_account',
      btn: 'manage_local_bank_account',
      title: localCardTitle,
      mediaIcon: <Phone />,
      isDisabled: false,
      shouldHighlightRed: isSetupNeeded && hasBalance, // Highlight if setup needed and has balance
      priority: isSetupNeeded && hasBalance ? 'high' : 'normal',
      hasBalance,
      balanceCount: startButtonBalances.length
    });

    // Sort cards by priority (high priority first)
    return baseCards.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    });
  }, [profileData, startButtonEnabled, startButtonBalances, loadingStartButton]);

  // Helper function to format balance
  const formatBalance = (amount, currency) => {
    const currencySymbols = {
      'NGN': '₦', 'GHS': 'GH₵', 'ZAR': 'R', 'KES': 'KSh',
      'UGX': 'USh', 'RWF': 'RF', 'TZS': 'TSh', 'ZMW': 'ZK', 'XOF': 'CFA'
    };
    
    const symbol = currencySymbols[currency] || currency;
    
    // Show abbreviated format for large amounts
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    } else {
      return `${symbol}${amount.toLocaleString()}`;
    }
  };

  return [cards, {
    startButtonEnabled,
    startButtonBalances,
    loadingStartButton,
    refreshStartButtonData: () => {
      setLoadingStartButton(true);
      // Re-trigger the effect by updating a dependency
    }
  }];
};

export default useAccountsCards;