import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material';
import { CheckCircle, Refresh, AccountBalance, Phone } from '@mui/icons-material';
import {
  getStartButtonBanksUrl,
  getStartButtonMobileOperatorsUrl,
  verifyStartButtonAccountUrl,
  saveStartButtonPayoutSettingsUrl,
  getStartButtonWalletBalance
} from '../../apis/apiEndPoints';

const StartButtonAccountSetup = ({ user, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
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
  const [error, setError] = useState('');
  const [currentBalance, setCurrentBalance] = useState(null);

  // Get user currency
  const getUserCurrency = (countryCode) => {
    const currencyMap = {
      'NG': 'NGN', 'GH': 'GHS', 'ZA': 'ZAR', 'KE': 'KES',
      'UG': 'UGX', 'RW': 'RWF', 'TZ': 'TZS', 'ZM': 'ZMW', 'CI': 'XOF'
    };
    return currencyMap[countryCode] || 'GHS';
  };

  const currency = getUserCurrency(user?.country?.isoCode);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [banksRes, operatorsRes, balanceRes] = await Promise.all([
        getStartButtonBanksUrl(currency),
        getStartButtonMobileOperatorsUrl(currency, { country: user?.country?.name }),
        getStartButtonWalletBalance().catch(() => null)
      ]);

      setBanks(banksRes?.data?.data || banksRes?.data || []);
      setOperators(operatorsRes?.data?.data?.operators || operatorsRes?.data?.operators || []);
      
      // Set current balance if available
      if (balanceRes?.data?.success) {
        const balances = balanceRes.data.data || [];
        const userBalance = balances.find(b => b.currency === currency);
        setCurrentBalance(userBalance || null);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load payment options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear errors when user makes changes
  };

  const verifyBankAccount = async () => {
    if (!formData.bankCode || !formData.accountNumber) {
      setError('Please select a bank and enter account number');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyStartButtonAccountUrl({
        bankCode: formData.bankCode,
        accountNumber: formData.accountNumber,
        countryCode: user?.country?.isoCode
      });

      if (response?.data?.data?.accountName) {
        handleInputChange('accountName', response.data.data.accountName);
        setActiveStep(2); // Move to confirmation step
      } else {
        setError('Could not verify account. Please check your details.');
      }
    } catch (error) {
      console.error('Account verification failed:', error);
      setError('Account verification failed. Please check your account details.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate method selection
      if (!payoutMethod) {
        setError('Please select a payout method');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Validate form data
      if (payoutMethod === 'bank') {
        if (!formData.bankCode || !formData.accountNumber) {
          setError('Please select a bank and enter account number');
          return;
        }
        verifyBankAccount();
      } else {
        if (!formData.MNO || !formData.msisdn || !formData.recipientFirstName || !formData.recipientLastName) {
          setError('Please fill in all mobile money details');
          return;
        }
        setActiveStep(2);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payoutSettings = {
        preferredMethod: payoutMethod,
        currency,
        country: user?.country?.name,
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

      await saveStartButtonPayoutSettingsUrl({ data: payoutSettings });
      onComplete?.();
    } catch (error) {
      console.error('Error saving payout settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, curr) => {
    const currencySymbols = {
      'NGN': '₦', 'GHS': 'GH₵', 'ZAR': 'R', 'KES': 'KSh',
      'UGX': 'USh', 'RWF': 'RF', 'TZS': 'TSh', 'ZMW': 'ZK', 'XOF': 'CFA'
    };
    const symbol = currencySymbols[curr] || curr;
    return `${symbol} ${amount?.toLocaleString() || '0'}`;
  };

  const steps = [
    {
      label: 'Choose Payment Method',
      description: 'Select how you want to receive payments'
    },
    {
      label: 'Enter Details',
      description: 'Provide your account information'
    },
    {
      label: 'Confirm Setup',
      description: 'Review and save your settings'
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Set Up Local Payout Method
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure your local bank account or mobile money to receive milestone payments in {currency}
      </Typography>

      {/* Current Balance Alert */}
      {currentBalance && currentBalance.availableBalance > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>You have funds waiting:</strong> {formatCurrency(currentBalance.availableBalance, currency)}
            <br />
            Set up your payout method to withdraw these funds.
          </Typography>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {step.description}
              </Typography>

              {/* Step 0: Choose Method */}
              {index === 0 && (
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <FormLabel component="legend">Payment Method</FormLabel>
                  <RadioGroup
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="bank"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalance fontSize="small" />
                          <span>Bank Transfer</span>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="mobile_money"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone fontSize="small" />
                          <span>Mobile Money</span>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              )}

              {/* Step 1: Enter Details */}
              {index === 1 && (
                <Box>
                  {payoutMethod === 'bank' ? (
                    <Box>
                      <TextField
                        select
                        fullWidth
                        label="Select Bank"
                        value={formData.bankCode}
                        onChange={(e) => handleInputChange('bankCode', e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{ mb: 2 }}
                        helperText={`${banks.length} banks available`}
                      >
                        <option value="">Choose a bank</option>
                        {banks.map((bank) => (
                          <option key={bank.code || bank.id} value={bank.code || bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </TextField>

                      <TextField
                        fullWidth
                        label="Account Number"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        sx={{ mb: 2 }}
                        helperText="Enter your bank account number"
                      />

                      {formData.accountName && (
                        <TextField
                          fullWidth
                          label="Account Name"
                          value={formData.accountName}
                          InputProps={{ readOnly: true }}
                          sx={{ mb: 2 }}
                          helperText="Verified account name"
                        />
                      )}
                    </Box>
                  ) : (
                    <Box>
                      <TextField
                        select
                        fullWidth
                        label="Mobile Money Operator"
                        value={formData.MNO}
                        onChange={(e) => handleInputChange('MNO', e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{ mb: 2 }}
                        helperText={`${operators.length} operators available`}
                      >
                        <option value="">Choose operator</option>
                        {operators.map((op) => (
                          <option key={op.code || op.id} value={op.code || op.id}>
                            {op.name}
                          </option>
                        ))}
                      </TextField>

                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.msisdn}
                        onChange={(e) => handleInputChange('msisdn', e.target.value)}
                        sx={{ mb: 2 }}
                        helperText="Enter phone number (e.g., +233...)"
                      />

                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={formData.recipientFirstName}
                          onChange={(e) => handleInputChange('recipientFirstName', e.target.value)}
                          required
                        />
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={formData.recipientLastName}
                          onChange={(e) => handleInputChange('recipientLastName', e.target.value)}
                          required
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Step 2: Confirmation */}
              {index === 2 && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="success" />
                      Setup Summary
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Method:</strong> {payoutMethod === 'bank' ? 'Bank Transfer' : 'Mobile Money'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Currency:</strong> {currency}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Country:</strong> {user?.country?.name}
                      </Typography>
                    </Box>

                    {payoutMethod === 'bank' ? (
                      <Box>
                        <Typography variant="body2">
                          <strong>Account Name:</strong> {formData.accountName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Account Number:</strong> {formData.accountNumber}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Bank:</strong> {banks.find(b => (b.code || b.id) === formData.bankCode)?.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2">
                          <strong>Recipient:</strong> {formData.recipientFirstName} {formData.recipientLastName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong> {formData.msisdn}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Operator:</strong> {operators.find(op => (op.code || op.id) === formData.MNO)?.name}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              <Box sx={{ mb: 1 }}>
                <Button
                  variant="contained"
                  onClick={index === steps.length - 1 ? handleSave : handleNext}
                  disabled={loading}
                  sx={{ mt: 1, mr: 1 }}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? 'Processing...' : index === steps.length - 1 ? 'Save Settings' : 'Continue'}
                </Button>
                {index > 0 && (
                  <Button
                    onClick={handleBack}
                    disabled={loading}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6">Setup Complete!</Typography>
          <Typography variant="body2" color="text.secondary">
            Your local payout method has been configured successfully.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StartButtonAccountSetup;