import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Skeleton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Button,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { 
  Refresh, 
  AccountBalance, 
  Phone, 
  CreditCard, 
  Visibility,
  Edit,
  CheckCircle,
  Settings
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  getWalletMilestoneTransactions,
  getWalletSummary,
  getStripeAccountDetails,
  getStartButtonPayoutSettingsUrl,
  getAccountOnboarding,
  postCreateStripeAccount,
  getExpressStripeDashboardLink
} from "../../apis/apiEndPoints";
import { useDispatch } from "react-redux";
import { ALERT_TYPE } from "../../utils/constants/config";
import { setAlert } from "../../redux/configSlice";
import { useNavigate } from "react-router-dom";
import NoData from "../../components/common/NoData";
import AccountsSkeleton from "../../components/skeleton/AccountsSkeleton";
import StartButtonAccountSetup from "../../components/accounts/StartButtonAccountSetup";
import { getLocalStorage } from "../../utils/localStorageUtils";
import { STRIPE_ACCOUNT_ID } from "../../utils/constants/auth";

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Transaction Detail Modal
const TransactionDetailModal = ({ open, onClose, transaction }) => {
  if (!transaction) return null;

  const formatCurrency = (amount, currency = 'USD') => {
    const currencySymbols = {
      'USD': '$', 'GHS': 'GH₵', 'NGN': '₦', 'KES': 'KSh',
      'UGX': 'USh', 'RWF': 'RF', 'TZS': 'TSh', 'ZMW': 'ZK', 'XOF': 'CFA'
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount}`;
  };

  const isLocalAccount = transaction.milestone?.paymentMethodProvider === 'startbutton';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isLocalAccount ? <Phone color="primary" /> : <CreditCard color="secondary" />}
          Transaction Details
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Basic Info */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary.main">
                  Basic Information
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Project</Typography>
                  <Typography variant="body1">{transaction.project}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Milestone</Typography>
                  <Typography variant="body1">{transaction.milestone?.title}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{transaction.milestone?.description || 'No description'}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">{transaction.date}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={transaction.hired} 
                    color={transaction.hired === 'Yes' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Info */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="secondary.main">
                  Payment Information
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Chip 
                    label={isLocalAccount ? 'Local Account' : 'Stripe (International)'} 
                    color={isLocalAccount ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Amount (USD)</Typography>
                  <Typography variant="h6" color="success.main">${transaction.walletCredit}</Typography>
                </Box>
                
                {/* Local Account specific info */}
                {isLocalAccount && transaction.milestone?.localCurrencyAmount && (
                  <>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Local Amount</Typography>
                      <Typography variant="body1">
                        {formatCurrency(
                          transaction.milestone.localCurrencyAmount, 
                          transaction.milestone.paymentCurrency
                        )}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Exchange Rate</Typography>
                      <Typography variant="body1">
                        1 USD = {transaction.milestone.exchangeRate} {transaction.milestone.paymentCurrency}
                      </Typography>
                    </Box>
                  </>
                )}
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                  <Chip 
                    label={transaction.milestone?.paymentStatus || 'Unknown'} 
                    color="success"
                    size="small"
                  />
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Payment ID</Typography>
                  <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                    {transaction.milestone?.paymentId || 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Fees Breakdown */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="info.main">
                  Fee Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Base Amount</Typography>
                    <Typography variant="body1">${transaction.milestone?.amount}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Service Fees</Typography>
                    <Typography variant="body1">${transaction.milestone?.serviceFees}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Platform Fees</Typography>
                    <Typography variant="body1">${transaction.milestone?.platformFees}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h6" color="primary.main">${transaction.milestone?.totalAmount}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Payout Settings Display Component
const PayoutSettingsDisplay = ({ settings, onEdit }) => {
  if (!settings) return null;

  return (
    <Card variant="outlined" sx={{ mb: 3, bgcolor: 'success.50', borderColor: 'success.200' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="success" />
            <Typography variant="h6" color="success.main">
              Local Account Configured
            </Typography>
          </Box>
          <Button 
            startIcon={<Edit />} 
            onClick={onEdit}
            size="small"
          >
            Edit
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Payment Method</Typography>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
              {settings.preferredMethod === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Currency</Typography>
            <Typography variant="body1">{settings.currency}</Typography>
          </Grid>
          
          {settings.preferredMethod === 'bank' && settings.bankDetails && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Account Name</Typography>
                <Typography variant="body1">{settings.bankDetails.accountName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Account Number</Typography>
                <Typography variant="body1">****{settings.bankDetails.accountNumber?.slice(-4)}</Typography>
              </Grid>
            </>
          )}
          
          {settings.preferredMethod === 'mobile_money' && settings.mobileMoneyDetails && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Mobile Operator</Typography>
                <Typography variant="body1">{settings.mobileMoneyDetails.MNO}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                <Typography variant="body1">****{settings.mobileMoneyDetails.msisdn?.slice(-4)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Recipient Name</Typography>
                <Typography variant="body1">
                  {settings.mobileMoneyDetails.recipientFirstName} {settings.mobileMoneyDetails.recipientLastName}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default function AccountPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profileData } = useSelector((state) => state.profile);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Common state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [allTransactions, setAllTransactions] = useState([]);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  
  // Modal state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [showStartButtonSetup, setShowStartButtonSetup] = useState(false);
  
  // Account setup state
  const [stripeAccountSetup, setStripeAccountSetup] = useState(false);
  const [startButtonSettings, setStartButtonSettings] = useState(null);
  const [stripeAccount, setStripeAccount] = useState({});
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(true);
  const [localAccountLoading, setLocalAccountLoading] = useState(true);
  
  const { loading } = useSelector((state) => state.config);

  // Check account setup status
  useEffect(() => {
    const checkAccountsSetup = async () => {
      if (!profileData) return;
      
      setAccountsLoading(true);
      setStripeLoading(true);
      setLocalAccountLoading(true);
      
      try {
        // Check both accounts in parallel
        const [stripeResponse, startButtonResponse] = await Promise.allSettled([
          getStripeAccountDetails(),
          getStartButtonPayoutSettingsUrl()
        ]);
        
        // Handle Stripe account response
        if (stripeResponse.status === 'fulfilled' && stripeResponse.value?.data) {
          setStripeAccount(stripeResponse.value.data);
          setStripeAccountSetup(stripeResponse.value.data.payouts_enabled === true);
        } else {
          setStripeAccount({});
          setStripeAccountSetup(false);
        }
        setStripeLoading(false);
        
        // Handle Local Account response
        if (startButtonResponse.status === 'fulfilled' && startButtonResponse.value?.data?.success) {
          setStartButtonSettings(startButtonResponse.value.data.data.settings);
        } else {
          setStartButtonSettings(null);
        }
        setLocalAccountLoading(false);
        
      } catch (error) {
        console.error('Error checking account setup:', error);
        setStripeLoading(false);
        setLocalAccountLoading(false);
      } finally {
        setAccountsLoading(false);
      }
    };

    checkAccountsSetup();
  }, [profileData]);

  // Fetch wallet summary
  useEffect(() => {
    async function fetchWalletSummary() {
      try {
        const response = await getWalletSummary();
        setSummaryData(response?.data?.data);
      } catch (error) {
        console.error(error);
        dispatch(setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        }));
      }
    }
    fetchWalletSummary();
  }, []);

  // Fetch transactions
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setPaginationLoading(true);
        const response = await getWalletMilestoneTransactions(page, pageSize);
        const { data: rows, total } = response?.data;

        setAllTransactions(rows || []);
        setTotal(total || 0);
      } catch (error) {
        console.error(error);
        dispatch(setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message,
        }));
      } finally {
        setPaginationLoading(false);
      }
    }
    fetchTransactions();
  }, [page, pageSize]);

  // Filter transactions by payment method
  const getFilteredTransactions = () => {
    if (tabValue === 0) {
      // International tab - Stripe transactions only
      return allTransactions.filter(t => t.milestone?.paymentMethodProvider === 'stripe' || !t.milestone?.paymentMethodProvider);
    } else {
      // Local tab - Local Account transactions
      return allTransactions.filter(t => t.milestone?.paymentMethodProvider === 'startbutton');
    }
  };

  // Calculate filtered summary
  const getFilteredSummary = () => {
    const filteredTransactions = getFilteredTransactions();
    const totalCredits = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.walletCredit || 0), 0);
    
    if (tabValue === 0) {
      // International summary - calculate everything from Stripe transactions only
      return {
        receipts: `$${totalCredits.toFixed(2)}`,
        payouts: summaryData?.payouts || '$0.00',
        balance: `$${(totalCredits - parseFloat(summaryData?.payouts?.replace('$', '') || '0')).toFixed(2)}`
      };
    } else {
      // Local summary (calculate from filtered transactions)
      return {
        receipts: `$${totalCredits.toFixed(2)}`,
        payouts: '$0.00',
        balance: `$${totalCredits.toFixed(2)}`
      };
    }
  };

  // Calculate overall summary for all transactions
  const getOverallSummary = () => {
    const totalCredits = allTransactions.reduce((sum, t) => sum + parseFloat(t.walletCredit || 0), 0);
    const stripeTransactions = allTransactions.filter(t => t.milestone?.paymentMethodProvider === 'stripe' || !t.milestone?.paymentMethodProvider);
    const localTransactions = allTransactions.filter(t => t.milestone?.paymentMethodProvider === 'startbutton');
    const stripeCredits = stripeTransactions.reduce((sum, t) => sum + parseFloat(t.walletCredit || 0), 0);
    const localCredits = localTransactions.reduce((sum, t) => sum + parseFloat(t.walletCredit || 0), 0);
    
    return {
      totalTransactions: allTransactions.length,
      totalCredits: `$${totalCredits.toFixed(2)}`,
      stripeCount: stripeTransactions.length,
      stripeCredits: `$${stripeCredits.toFixed(2)}`,
      localCount: localTransactions.length,
      localCredits: `$${localCredits.toFixed(2)}`
    };
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset pagination when switching tabs
  };

  const renderOverallSummary = () => {
    const overallSummary = getOverallSummary();
    
    return (
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Overall Transaction Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                {overallSummary.totalTransactions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                {overallSummary.totalCredits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Credits
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 600 }}>
                {overallSummary.stripeCredits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                International ({overallSummary.stripeCount} transactions)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                {overallSummary.localCredits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Local ({overallSummary.localCount} transactions)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  const handleStripeAccount = async () => {
    try {
      const stripeAccountId = JSON?.parse(getLocalStorage(STRIPE_ACCOUNT_ID));
      
      if (!stripeAccountSetup) {
        // Setup new account
        const payload = {
          email: profileData?.email,
          fullName: `${profileData?.firstName} ${profileData?.lastName}`,
          country: profileData?.country?.isoCode,
        };
        const response = await postCreateStripeAccount(payload);

        if (response?.data?.account?.id) {
          const onboardingResponse = await getAccountOnboarding();
          if (onboardingResponse?.data?.data?.url) {
            window.open(onboardingResponse.data.data.url, "_self");
          }
        }
      } else {
        // Manage existing account
        if (stripeAccount?.payouts_enabled === false) {
          const response = await getAccountOnboarding();
          if (response?.data?.data?.url) {
            window.open(response.data.data.url, "_self");
          }
        } else {
          const response = await getExpressStripeDashboardLink(stripeAccountId);
          if (response?.data?.url) {
            window.open(response.data.url, "_blank");
          }
        }
      }
    } catch (error) {
      console.error('Stripe account error:', error);
      dispatch(setAlert({
        show: true,
        type: ALERT_TYPE.error,
        message: error.message,
      }));
    }
  };

  const handleStartButtonSetupComplete = async () => {
    setShowStartButtonSetup(false);
    setLocalAccountLoading(true);
    
    try {
      // Refresh settings
      const response = await getStartButtonPayoutSettingsUrl();
      if (response?.data?.success) {
        setStartButtonSettings(response.data.data.settings);
      }
      
      dispatch(setAlert({
        show: true,
        type: ALERT_TYPE.success,
        message: "Local Account payout method setup completed successfully!",
      }));
    } catch (error) {
      console.error('Error refreshing local account settings:', error);
    } finally {
      setLocalAccountLoading(false);
    }
  };

  const renderAccountManagement = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant={stripeAccountSetup ? "outlined" : "contained"}
            startIcon={stripeLoading ? null : <AccountBalance />}
            onClick={handleStripeAccount}
            disabled={stripeLoading}
            sx={{
              ...(stripeAccountSetup ? {} : {
                bgcolor: 'error.main',
                '&:hover': { bgcolor: 'error.dark' }
              })
            }}
          >
            {stripeLoading ? (
              <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Loading...</>
            ) : (
              stripeAccountSetup ? 'Manage International Account' : 'Setup International Account'
            )}
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant={startButtonSettings ? "outlined" : "contained"}
            startIcon={localAccountLoading ? null : <Phone />}
            onClick={() => setShowStartButtonSetup(true)}
            disabled={localAccountLoading}
            sx={{
              ...(startButtonSettings ? {} : {
                bgcolor: 'warning.main',
                '&:hover': { bgcolor: 'warning.dark' }
              })
            }}
          >
            {localAccountLoading ? (
              <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Loading...</>
            ) : (
              startButtonSettings ? 'Manage Local Account' : 'Setup Local Account'
            )}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSummaryCards = () => {
    const summary = getFilteredSummary();
    const isLocal = tabValue === 1;
    
    return (
      <Grid container spacing={3} mb={4}>
        {Object.entries(summary).map(([key, value], index) => (
          <Grid item key={key} xs={12} sm={6} md={4}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderRadius: "12px", 
                minHeight: "107px", 
                padding: "20px",
                ...(isLocal && {
                  bgcolor: 'primary.50',
                  borderColor: 'primary.200'
                })
              }}
            >
              <CardContent sx={{ p: "0 !important" }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "14px", fontWeight: 500 }}
                  color={isLocal ? "primary.main" : "textSecondary"}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)} {isLocal ? '(Local)' : '(International)'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "24px", sm: "26px", md: "28px", lg: "32px" },
                    fontWeight: 600,
                    ...(isLocal && { color: 'primary.dark' })
                  }}
                >
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTransactionTable = () => {
    const filteredTransactions = getFilteredTransactions();
    const isLocal = tabValue === 1;

    return (
      <>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "12px" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F9FAFB", "& .MuiTableCell-root": { fontSize: "12px", py: 1, color: "text.secondary" } }}>
                <TableCell>Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Milestone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                {isLocal && <TableCell>Local Currency</TableCell>}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginationLoading ? (
                [...Array(pageSize)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(isLocal ? 7 : 6)].map((_, cellIndex) => (
                      <TableCell key={cellIndex}><Skeleton height={30} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((row, index) => (
                  <TableRow key={index} sx={{ "& .MuiTableCell-root": { py: 3, color: "text.secondary" } }}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.project}</TableCell>
                    <TableCell sx={{ color: "#709A1C !important", textDecoration: "underline", cursor: "pointer" }}
                      onClick={() => navigate(`/my-contracts/view/${row.milestone?.jobId}`)}>
                      {row.milestone?.title}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.hired} 
                        variant="outlined" 
                        size="small"
                        color={row.hired === 'Yes' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      ${row.walletCredit}
                    </TableCell>
                    {isLocal && (
                      <TableCell>
                        {row.milestone?.localCurrencyAmount && row.milestone?.paymentCurrency ? (
                          <Typography variant="body2">
                            {row.milestone.paymentCurrency} {row.milestone.localCurrencyAmount}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">N/A</Typography>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleTransactionClick(row)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isLocal ? 7 : 6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <NoData />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={(e, newPage) => setPage(newPage + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </>
    );
  };

  if (loading) return <AccountsSkeleton />;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Account Management
      </Typography>

      {/* Account Management Buttons */}
      {renderAccountManagement()}

      {/* Setup Alerts - Only show after loading */}
      {!accountsLoading && !stripeAccountSetup && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Set up your Stripe account to receive international payments in USD.
        </Alert>
      )}
      {!accountsLoading && !startButtonSettings && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Set up your local account to receive payments in your local currency.
        </Alert>
      )}

      {/* Overall Summary */}
      {renderOverallSummary()}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            label="International Payments" 
            icon={<CreditCard />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab 
            label="Local Payments" 
            icon={<Phone />} 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {renderSummaryCards()}
        {renderTransactionTable()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderSummaryCards()}
        {renderTransactionTable()}
      </TabPanel>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={showTransactionDetail}
        onClose={() => setShowTransactionDetail(false)}
        transaction={selectedTransaction}
      />

      {/* Local Account Setup/Management Dialog */}
      <Dialog
        open={showStartButtonSetup}
        onClose={() => setShowStartButtonSetup(false)}
        maxWidth="md"
        fullWidth
      >
        {startButtonSettings ? (
          // Show configured account details
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone color="primary" />
                <Typography variant="h6">Manage Local Account</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <PayoutSettingsDisplay 
                settings={startButtonSettings} 
                onEdit={() => {}} 
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Account Actions</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<Edit />}
                      onClick={() => {
                        // Close this dialog and open setup for editing
                        setStartButtonSettings(null);
                      }}
                    >
                      Edit Account Details
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<Settings />}
                      color="secondary"
                    >
                      View Transaction History
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowStartButtonSetup(false)}>Close</Button>
            </DialogActions>
          </>
        ) : (
          // Show setup form
          <DialogContent sx={{ p: 0 }}>
            <StartButtonAccountSetup
              user={profileData}
              onComplete={handleStartButtonSetupComplete}
            />
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}