import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  TablePagination,
  Tooltip,
} from "@mui/material";
import { CloudUpload, Delete, Refresh } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { checkLeadsUrl, sendLeadEmailUrl, sendWhatsappMessageUrl } from "../../../apis/apiEndPoints";
import { Skeleton } from "@mui/material";
import { IconButton } from "@mui/material";
import { Email } from "@mui/icons-material";

type Status = 'joined' | 'message_sent' | 'failed_to_send_message' | 'email_sent';
interface CsvData {
  email: string;
  name: string;
  phone: string;
  status?: Status;
  disabled?: boolean;
}

const statusColors = {
  joined: "grey",
  message_sent: "green",
  email_sent: "green",
  failed_to_send_message: "red",
}

const Leads = () => {
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<{ phoneNumber: string; receiverName: string; email: string }[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [customMessage, setCustomMessage] = useState<string>(
    "Lets join Buildeezy"
  );
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [isSendWhatsappMessage, setIsSendWhatsappMessage] = useState<boolean>(true);

  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n");
    const result: string[][] = [];

    for (let line of lines) {
      if (line.trim() === "") continue;

      const row: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Handle escaped quotes
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          row.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      // Add the last field
      row.push(current.trim());
      result.push(row);
    }

    return result;
  };

  const handleUpdateData = async (uploadData: {email: string, name: string, phone: string}[]) => {
    setIsLoading(true);
    const response = await checkLeadsUrl(uploadData);
    const leadsData = response.data.leads;
    const headers = leadsData[0] ? Object.keys(leadsData[0]) : [];
    setHeaders(headers);

    setCsvData(
      leadsData.map((lead) => ({
        ...lead,
        status: lead.status ?? "",
        disabled: lead.status === "joined",
      }))
    );
    setIsLoading(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file");
      return;
    }

    setError("");
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = async (event) => {
      setIsLoading(true);
      try {
        const text = event.target?.result as string;
        if (!text) {
          setError("Could not read file content");
          return;
        }

        const data = parseCSV(text);

        if (data.length > 0) {
          const headerRow = data[0].map((header) => header.toLowerCase());
          const rows = data
            .slice(1)
            .filter((row) => row.some((cell) => cell.trim() !== ""));

          const parsedData = rows.map((row) => {
            const rowData = {
              email: "",
              name: "",
              phone: "",
            };
            headerRow.forEach((header, index) => {
              rowData[header] = row[index]?.trim() || "";
            });
            return rowData;
          }).filter((row) => row.phone.trim() !== "");

          // check existing users
          const uploadData = parsedData.map((row) => {
            let _phone = row.phone.replace(/[^0-9]/g, '');
            if(_phone.slice(0, 1) !== '+') {
              _phone = '+' + _phone;
            }

            return {
              email: row.email,
              name: row.name,
              phone: _phone,
            };
          });
          await handleUpdateData(uploadData);
        }
      } catch (err) {
        console.error("Error parsing CSV file", err);
        setError("Error parsing CSV file");
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
    };

    reader.readAsText(file);
  }, []);

  useEffect(() => {
    console.log(csvData);
  }, [csvData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const clearData = () => {
    setCsvData([]);
    setHeaders([]);
    setFileName("");
    setError("");
    setSelectedRows([]);
    setPage(0);
  };

  const handleSendLeadsWhatsappMessage = async () => {
    setIsSendWhatsappMessage(true);
    setDialogOpen(true);
    setCustomMessage("Lets join Buildeezy");
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCustomMessage("");
  };

  const handleSubmitMessage = async () => {
    setIsLoading(true);
    try {
      const response = await (isSendWhatsappMessage ? sendWhatsappMessageUrl : sendLeadEmailUrl)({
       users: selectedRows
       // filter out empty phone numbers or emails
       .filter((row) => isSendWhatsappMessage ? row.phoneNumber.trim() !== "" : row.email.trim() !== "")
       .map((row) => ({
        receiverName: row.receiverName,
        ...(isSendWhatsappMessage ? {phoneNumber: row.phoneNumber} : {email: row.email}),
       })),
       message: customMessage,
      });

      const responseResults = response.data.results;
      const responseKeys = Object.keys(responseResults);


      // update status to sent
        setCsvData(csvData.map((row) => {
          if (responseKeys.includes(isSendWhatsappMessage ? row.phone : row.email)) {
            return {
              ...row,
              status: responseResults[isSendWhatsappMessage ? row.phone : row.email]=== true 
              ? (isSendWhatsappMessage ? 'message_sent' : 'email_sent')
              : 'failed_to_send_message',
            };
          }
          return row;
        }));

      // Close dialog after successful submission
      setDialogOpen(false);
      setCustomMessage("");
    } catch (error) {
      console.error("Error triggering lead import:", error);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleSendLeadsEmail = () => {
    setIsSendWhatsappMessage(false);
    setCustomMessage("Lets join Buildeezy");
    setDialogOpen(true);
  };


  const handleSelectAll = () => {
    const paginatedDataSelectedAtOnce = paginatedData
    .filter(row => !row.disabled)
    .every(row => 
      selectedRows.find(item => item.phoneNumber === row.phone)
    );
    
    if (paginatedDataSelectedAtOnce) {
      // Deselect all current page items
      setSelectedRows(prev => prev.filter(item => 
        !paginatedData.find(row => row.phone === item.phoneNumber)
      ));
    } else {
      // Select all current page items
      const newSelections = paginatedData.map(row => ({
        phoneNumber: row.phone,
        receiverName: row.name,
        email: row.email,
        disabled: row.disabled,
      })).filter(row => !row.disabled);
      setSelectedRows(prev => {
        const filtered = prev.filter(item => 
          !paginatedData.find(row => row.phone === item.phoneNumber)
        );
        return [...filtered, ...newSelections];
      });
    }
  };

  const handleSelectRow = (phoneNumber: string, receiverName: string, email: string) => {
    setSelectedRows((prev) => {
      if (prev.find((item) => item.phoneNumber === phoneNumber)) {
        return prev.filter((index) => index.phoneNumber !== phoneNumber);
      } else {
        return [...prev, { phoneNumber, receiverName, email }];
      }
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = csvData
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  .filter(row => row.phone.includes(search) || row.name.includes(search) || row.email.includes(search));
  const currentPageSelectedCount = paginatedData.filter(row => 
    selectedRows.find(item => item.phoneNumber === row.phone)
  ).length;
  const isAllCurrentPageSelected = currentPageSelectedCount === paginatedData.length && paginatedData.length > 0;
  const isCurrentPageIndeterminate = currentPageSelectedCount > 0 && currentPageSelectedCount < paginatedData.length;

  const getSelectedPhoneNumbers = (shorten: boolean = false) => {
    const selectedRowsText = selectedRows
      .map((row) => row.phoneNumber)
      .filter((phone) => phone)
      .join(";");

    if(selectedRowsText.length > 50 && shorten) {
      return selectedRowsText.slice(0, 50) + "...";
    }
    return selectedRowsText;
  };

  const getSelectedEmails = (shorten: boolean = false) => {
    const selectedRowsText = selectedRows
      .map((row) => row.email)
      .filter((email) => email)
      .join(";");

    if(selectedRowsText.length > 50 && shorten) {
      return selectedRowsText.slice(0, 50) + "...";
    }
    return selectedRowsText;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t("admin_leads.title")}
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={60} />
          <Skeleton variant="rectangular" width="100%" height={400} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={120} height={36} />
          </Box>
        </Box>
      ) : csvData.length === 0 ? (
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "grey.300",
            backgroundColor: isDragActive ? "action.hover" : "background.paper",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive
              ? t("admin_leads.drop_csv_here")
              : t("admin_leads.drag_drop_csv")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("admin_leads.only_csv_accepted")}
          </Typography>
        </Paper>
      ) : (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">
              {t("admin_leads.data_from")}: {fileName}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                placeholder="Search leads..."
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outlined" color="success" startIcon={<Refresh />} onClick={() => handleUpdateData(csvData) } disabled={isLoading}>
                {t("admin_leads.update_data")}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={clearData}
                disabled={isLoading}
              >
                {t("admin_leads.clear_data")}
              </Button>

              <Button
                variant="contained"
                color="primary"
                startIcon={<Email />}
                onClick={handleSendLeadsEmail}
                disabled={isLoading || selectedRows.length === 0}
              >
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  t("admin_leads.send_leads_email")
                )}
              </Button>

              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUpload />}
                onClick={handleSendLeadsWhatsappMessage}
                disabled={isLoading || selectedRows.length === 0}
              >
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  t("admin_leads.send_leads_whatsapp_message")
                )}
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isAllCurrentPageSelected}
                      indeterminate={isCurrentPageIndeterminate}
                      onChange={handleSelectAll}
                      color="primary"
                    />
                  </TableCell>
                  {headers.map((header, index) => (
                    <TableCell key={index} sx={{ fontWeight: "bold" }}>
                      {header.charAt(0).toUpperCase() + header.slice(1)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={page * rowsPerPage + index} hover >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={!!selectedRows.find((item) => item.phoneNumber === row.phone)}
                        onChange={() => handleSelectRow(row.phone, row.name, row.email)}
                        color="primary"
                        disabled={row.disabled}
                      />
                    </TableCell>
                    {headers.map((header, colIndex) => {
                      if(header==='status') {
                        return <TableCell key={colIndex} sx={{ color: statusColors[row.status as keyof typeof statusColors] }}>{row.status ? t(`admin_leads.${row.status}`) : ''}</TableCell>
                      }
                      return <TableCell key={colIndex}>{row[header]}</TableCell>
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={csvData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Total rows: {csvData.length} | Selected: {selectedRows.length}
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <InputLabel
            sx={{
              mb: 2,
            }}
          >
            {t("admin_leads.selected_phone_numbers")}
          </InputLabel>
          <Tooltip title={isSendWhatsappMessage ? getSelectedPhoneNumbers(false) : getSelectedEmails(false)} arrow>
            <TextField
              value={isSendWhatsappMessage ? getSelectedPhoneNumbers(true) : getSelectedEmails(true)}
              multiline
              maxRows={3}
              disabled
              sx={{
                width: "100%",
                mb: 2,
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "grey.600",
                },
              }}
            />
          </Tooltip>
          <InputLabel
            sx={{
              mb: 2,
            }}
          >
            {t("admin_leads.message")}
          </InputLabel>
          <TextField
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            fullWidth
            sx={{
              width: "100%",
              minHeight: "100px",
              mb: 2,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={isLoading}>
            {t("admin_leads.cancel")}
          </Button>
          <Button
            onClick={handleSubmitMessage}
            variant="contained"
            disabled={isLoading || !customMessage.trim()}
          >
            {isLoading ? <CircularProgress size={20} /> : t("admin_leads.submit")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leads;
