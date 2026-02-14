import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { 
  Box, 
  Typography, 
  Grid, 
  Divider, 
  Alert, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  CircularProgress
} from "@mui/material";
import AcountsCard from "./AcountsCard";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { STRIPE_ACCOUNT_ID, USER_DATA } from "../../utils/constants/auth";
import {
  getAccountOnboarding,
  postCreateStripeAccount,
  getExpressStripeDashboardLink,
  getStripeAccountDetails,
  getStartButtonPayoutSettingsUrl,
  saveStartButtonPayoutSettingsUrl,
  getStartButtonBanksUrl,
  verifyStartButtonAccountUrl,
  getStartButtonMobileOperatorsUrl,
  getStartButtonWalletBalance,
} from "../../apis/apiEndPoints";
import { useDispatch } from "react-redux";
import { setAlert } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { useState, useEffect } from "react";
import SpinnerLoader from "../common/SpinnerLoader";
import VerifyBankAccount from "./VerifyBankAccount";

// Helper function to format currency
const formatCurrencyAmount = (amount, currency) => {
  const currencySymbols = {
    'NGN': '₦', 'GHS': 'GH₵', 'ZAR': 'R', 'KES': 'KSh',
    'UGX': 'USh', 'RWF': 'RF', 'TZS': 'TSh', 'ZMW': 'ZK', 'XOF': 'CFA'
  };
  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${amount?.toLocaleString() || '0'}`;
};

// StartButton Setup Alert Component - REMOVED userType restriction
const StartButtonSetupAlert = ({ onSetupClick, balance }) => {
  return (
    <Alert severity="warning" sx={{ mb: 3 }}>
      <Typography variant="body2">
        <strong>Local Payout Method Required:</strong> Set up your local bank account or mobile money to receive payments.
        {balance && balance.availableBalance > 0 && (
          <span style={{ color: '#f57c00', fontWeight: 'bold' }}>
            {' '}You have funds waiting: {formatCurrencyAmount(balance.availableBalance, balance.currency)}
          </span>
        )}
      </Typography>
      <Button variant="outlined" size="small" onClick={onSetupClick}>
        Setup Local Account
      </Button>
    </Alert>
  );
};

// StartButton Setup Dialog Component  
const StartButtonSetupDialog = ({ open, onClose, userCountry, onSave }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [formData, setFormData] = useState({
    bankCode: '',
    accountNumber: '',
    accountName: '',
    MNO: '',
    msisdn: '',
    recipientFirstName: '',
    recipientLastName: ''
  });
  const [banks, setBanks] = useState([]);
  const [operators, setOperators] = useState([]);
  
  // Get user currency based on country
  const getUserCurrency = (countryCode) => {
    const currencyMap = {
      'NG': 'NGN', 'GH': 'GHS', 'ZA': 'ZAR', 'KE': 'KES',
      'UG': 'UGX', 'RW': 'RWF', 'TZ': 'TZS', 'ZM': 'ZMW', 'CI': 'XOF'
    };
    return currencyMap[countryCode] || 'GHS';
  };
  
  const currency = getUserCurrency(userCountry?.isoCode);

  useEffect(() => {
    if (open && currency) {
      loadBanksAndOperators();
    }
  }, [open, currency]);

  const loadBanksAndOperators = async () => {
    try {
      setLoading(true);
      
      const [banksRes, operatorsRes] = await Promise.all([
        getStartButtonBanksUrl(currency),
        getStartButtonMobileOperatorsUrl(currency, { country: userCountry?.name || "Ghana" })
      ]);
      
      const banksData = banksRes?.data?.data || banksRes?.data || [];
      setBanks(Array.isArray(banksData) ? banksData : []);
      
      const operatorsData = operatorsRes?.data?.data?.operators || 
                           operatorsRes?.data?.operators || 
                           operatorsRes?.data || [];
      setOperators(Array.isArray(operatorsData) ? operatorsData : []);
      
    } catch (error) {
      console.error('Error loading banks/operators:', error);
      setBanks([]);
      setOperators([]);
      alert('Failed to load payment options. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const verifyAccount = async () => {
    if (payoutMethod === 'bank' && formData.bankCode && formData.accountNumber) {
      try {
        setLoading(true);
        const response = await verifyStartButtonAccountUrl({
          bankCode: formData.bankCode,
          accountNumber: formData.accountNumber,
          countryCode: userCountry?.isoCode
        });
        
        if (response?.data?.data?.accountName) {
          handleInputChange('accountName', response.data.data.accountName);
        }
      } catch (error) {
        console.error('Account verification failed:', error);
        handleInputChange('accountName', '');
        alert('Account verification failed. Please check your account details.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const isFormValid = () => {
    if (payoutMethod === 'bank') {
      return formData.bankCode && formData.accountNumber && formData.accountName;
    } else {
      return formData.MNO && formData.msisdn && 
             formData.recipientFirstName && formData.recipientLastName;
    }
  };
  
  const handleSave = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const payoutSettings = {
        preferredMethod: payoutMethod,
        currency,
        country: userCountry?.name,
        ...(payoutMethod === 'bank' ? {
          bankDetails: {
            bankCode: formData.bankCode,
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
            verified: !!formData.accountName
          }
        } : {
          mobileMoneyDetails: {
            MNO: formData.MNO,
            msisdn: formData.msisdn,
            recipientFirstName: formData.recipientFirstName,
            recipientLastName: formData.recipientLastName,
            verified: false
          }
        })
      };
      
      const response = await saveStartButtonPayoutSettingsUrl({ data: payoutSettings });
      
      onSave?.();
      onClose();
      alert('Local payout settings saved successfully!');
    } catch (error) {
      console.error('Error saving payout settings:', error);
      alert('Failed to save payout settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Local Bank Account Setup - {currency}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Choose Local Payout Method</FormLabel>
            <RadioGroup
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
            >
              <FormControlLabel value="bank" control={<Radio />} label="Local Bank Account" />
              <FormControlLabel value="mobile_money" control={<Radio />} label="Mobile Money" />
            </RadioGroup>
          </FormControl>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}
          
          {payoutMethod === 'bank' && !loading && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  select
                  label="Select Local Bank"
                  value={formData.bankCode}
                  onChange={(e) => handleInputChange('bankCode', e.target.value)}
                  SelectProps={{ native: true }}
                  helperText={`${banks.length} banks available`}
                >
                  <option value="">Choose a bank</option>
                  {banks.map((bank) => (
                    <option key={bank.code || bank.id} value={bank.code || bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </TextField>
              </FormControl>
              
              <TextField
                fullWidth
                label="Account Number"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                onBlur={verifyAccount}
                sx={{ mb: 2 }}
                helperText="Enter your local bank account number"
              />
              
              <TextField
                fullWidth
                label="Account Name"
                value={formData.accountName}
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
                helperText="Account name will be verified automatically"
              />
            </Box>
          )}
          
          {payoutMethod === 'mobile_money' && !loading && (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <TextField
                  select
                  label="Mobile Money Operator"
                  value={formData.MNO}
                  onChange={(e) => handleInputChange('MNO', e.target.value)}
                  SelectProps={{ native: true }}
                  helperText={`${operators.length} operators available`}
                >
                  <option value="">Choose operator</option>
                  {operators.map((op) => (
                    <option key={op.code || op.id} value={op.code || op.id}>
                      {op.name}
                    </option>
                  ))}
                </TextField>
              </FormControl>
              
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.msisdn}
                onChange={(e) => handleInputChange('msisdn', e.target.value)}
                sx={{ mb: 2 }}
                helperText="Enter phone number in international format (+233...)"
              />
              
              <TextField
                fullWidth
                label="First Name"
                value={formData.recipientFirstName}
                onChange={(e) => handleInputChange('recipientFirstName', e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              
              <TextField
                fullWidth
                label="Last Name"
                value={formData.recipientLastName}
                onChange={(e) => handleInputChange('recipientLastName', e.target.value)}
                sx={{ mb: 2 }}
                required
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={loading || !isFormValid()}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Saving...' : 'Save Local Setup'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AccountsTabsAndSearch = ({ cards }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = JSON?.parse(getLocalStorage(USER_DATA));
  const [loading, setLoading] = useState(false);
  const [stripeAccount, setStripeAccount] = useState({});
  const [needsStartButtonSetup, setNeedsStartButtonSetup] = useState(false);
  const [showStartButtonSetup, setShowStartButtonSetup] = useState(false);
  const [startButtonBalance, setStartButtonBalance] = useState(null);
  
  // Get user currency
  const getUserCurrency = (countryCode) => {
    const currencyMap = {
      'NG': 'NGN', 'GH': 'GHS', 'ZA': 'ZAR', 'KE': 'KES',
      'UG': 'UGX', 'RW': 'RWF', 'TZ': 'TZS', 'ZM': 'ZMW', 'CI': 'XOF'
    };
    return currencyMap[countryCode] || 'USD';
  };

  // Check StartButton status and fetch balance - REMOVED userType restriction
  const checkStartButtonStatus = async () => {
    try {
      const [settingsResponse, balanceResponse] = await Promise.all([
        getStartButtonPayoutSettingsUrl().catch(() => null),
        getStartButtonWalletBalance().catch(() => null)
      ]);
      
      const enabled = settingsResponse?.data?.data?.enabled || false;
      setNeedsStartButtonSetup(!enabled);
      
      // Set balance if available
      if (balanceResponse?.data?.success) {
        const balances = balanceResponse.data.data || [];
        const userCurrency = getUserCurrency(user?.user?.country?.isoCode);
        const userBalance = balances.find(b => b.currency === userCurrency);
        setStartButtonBalance(userBalance || null);
      }
    } catch (error) {
      console.error('Error checking StartButton status:', error);
      setNeedsStartButtonSetup(true);
    }
  };

  const handleSetupComplete = () => {
    checkStartButtonStatus();
  };

  useEffect(() => {
    checkStartButtonStatus();
  }, []);

  // Show StartButton alert - REMOVED userType restriction
  const showStartButtonAlert = needsStartButtonSetup;

  useEffect(() => {
    if (!user) {
      return;
    }
    setLoading(true);
    const fetchStripeAccountDetails = async () => {
      try {
        const response = await getStripeAccountDetails();

        if (response?.data) {
          setStripeAccount(response?.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("fetchStripeAccountDetails", error);
        setLoading(false);

        dispatch(
          setAlert({
            show: true,
            type: ALERT_TYPE.error,
            message: error.message,
          })
        );
      }
    };
    fetchStripeAccountDetails();
  }, []);

  const CreateStripeAccount = async () => {
    try {
      setLoading(true);
      const payload = {
        email: user?.user?.email,
        fullName: user?.user?.firstName + " " + user?.user?.lastName,
        country: user?.user?.country?.isoCode,
      };
      const response = await postCreateStripeAccount(payload);

      if (response?.data?.account?.id) {
        try {
          const response = await getAccountOnboarding();

          if (response?.data?.data?.url) {
            window.open(response?.data?.data?.url, "_self");
          }
        } catch (error) {
          console.error("Creating Stripe account onboarding", error);
          setLoading(false);

          dispatch(
            setAlert({
              show: true,
              type: ALERT_TYPE.error,
              message: error.message,
            })
          );
        }
      }
    } catch (error) {
      console.error("Creating Stripe account", error);
      setLoading(false);

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
    }
  };

  const StripeAccountRetrieve = async () => {
    try {
      const stripeAccountId = JSON?.parse(getLocalStorage(STRIPE_ACCOUNT_ID));
      if (!stripeAccountId) {
        console.error("No Stripe account ID found");
        setLoading(false);
        return;
      }
      if (!stripeAccount?.id) {
        console.error("No Stripe account data found");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      if (stripeAccount?.payouts_enabled === false) {
        const requirements = stripeAccount?.requirements?.currently_due || [];
        if (requirements.length > 0) {
          const response = await getAccountOnboarding();
          if (response?.data?.data?.url) {
            window.open(response?.data?.data?.url, "_self");
          }
        }
      } else {
        const response = await getExpressStripeDashboardLink(stripeAccountId);
        if (response?.data?.url) {
          window.open(response?.data?.url, "_blank");
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Stripe account retrieve error", error);
      setLoading(false);

      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        })
      );
    }
  };

  const shouldShowVerifyBankAccount = (stripeAccount, user) => {
    // REMOVED userType restriction - both clients and contractors can have Stripe accounts
    if (Object.keys(stripeAccount || {}).length === 0) return true;
    if (stripeAccount?.payouts_enabled === false) return true;
    return false;
  };

  const showVerify = shouldShowVerifyBankAccount(stripeAccount, user);

  // Handle different button clicks
  const handleCardClick = (btn, id) => {
    console.log('Card clicked:', btn, id);
    
    switch (btn) {
      case "setup_international_account":
        CreateStripeAccount();
        break;
      case "manage_international_account":
        StripeAccountRetrieve();
        break;
      case "manage_local_bank_account":
        setShowStartButtonSetup(true);
        break;
      default:
        console.log("Unknown button action:", btn);
    }
  };

  if (loading) return <SpinnerLoader />;

  return (
    <>
      {/* StartButton Setup Alert - Available for all users */}
      {showStartButtonAlert && (
        <StartButtonSetupAlert 
          onSetupClick={() => setShowStartButtonSetup(true)} 
          balance={startButtonBalance}
        />
      )}

      {/* Stripe Bank Account Verification */}
      {shouldShowVerifyBankAccount(stripeAccount, user) && (
        <VerifyBankAccount
          handleNavigate={
            showVerify ? CreateStripeAccount : StripeAccountRetrieve
          }
        />
      )}

      <Box mb={3}>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          wrap="nowrap"
          spacing={2}
        >
          <Grid item>
            <Typography
              sx={{
                fontSize: {
                  xs: "20px",
                  sm: "24px",
                  md: "28px",
                  lg: "30px",
                },
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {t("accounts.account")}
            </Typography>
          </Grid>

          {/* Search Component */}
          <Grid item sx={{ flexGrow: 1 }} xs={12} sm={6} md={4} lg={3.7}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "background.paper",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "divider",
                height: "40px",
                pl: 1.5,
                pr: 2,
                gap: 1,
                width: "100%",
              }}
            >
              <SearchIcon sx={{ color: "text.disabled", fontSize: "20px" }} />
              <input
                type="text"
                placeholder={t("accounts.search")}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  color: "inherit",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Display StartButton balance info if available - Available for all users */}
      {startButtonBalance && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ bgcolor: 'primary.50', borderColor: 'primary.200' }}>
            <Typography variant="body2">
              <strong>Local Wallet Balance:</strong> {formatCurrencyAmount(startButtonBalance.availableBalance, startButtonBalance.currency)}
              {startButtonBalance.pendingBalance > 0 && (
                <span style={{ color: '#f57c00', marginLeft: '10px' }}>
                  (Pending: {formatCurrencyAmount(startButtonBalance.pendingBalance, startButtonBalance.currency)})
                </span>
              )}
            </Typography>
          </Alert>
        </Box>
      )}

      <Box
        sx={{ my: 3, display: "flex", flexWrap: "wrap", gap: 2 }}
        container
        spacing={2}
        justifyContent={{ xs: "center", sm: "flex-end" }}
      >
        {cards?.map(({ id, btn, title, isDisabled, onClick, ...rest }) => (
          <AcountsCard
            key={id}
            disabled={isDisabled}
            onClick={() => handleCardClick(btn, id)}
            title={title}
            shouldHighlightRed={
              btn === "setup_international_account" && shouldShowVerifyBankAccount(stripeAccount, user)
            }
            {...rest}
          />
        ))}
      </Box>
      
      {/* StartButton Setup Dialog */}
      <StartButtonSetupDialog
        open={showStartButtonSetup}
        onClose={() => setShowStartButtonSetup(false)}
        userCountry={user?.user?.country}
        onSave={handleSetupComplete}
      />
    </>
  );
};

export default AccountsTabsAndSearch;