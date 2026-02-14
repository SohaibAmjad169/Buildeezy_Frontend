import React, { useState, useEffect } from "react";
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
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getMarketingMessagesHistoryUrl } from "../../../apis/apiEndPoints";
import { TableVirtuoso, TableComponents } from "react-virtuoso";
import MessageLogFilters from "./MessageLogFilters";
import { useCallback } from "react";
import debounce from "lodash/debounce";

type TMessageTypes =
  | "text"
  | "html"
  | "image"
  | "file"
  | "gif"
  | "location"
  | "carousel"
  | "list"
  | "section"
  | "authentication"
  | "template"
  | "action";
type TStatus =
  | "accepted"
  | "rejected"
  | "processing"
  | "scheduled"
  | "sent"
  | "sending_failed"
  | "delivered"
  | "delivery_failed"
  | "deleted"
  | "skipped";
type TMessage = {
  id: string;
  batchId: string | null;
  body: any;
  channelId: string;
  chargeableUnits: number;
  context: any;
  createdAt: string;
  direction: "outgoing" | "incoming";
  failure?: {
    code: number;
    description: string;
    source: any;
  };
  lastStatusAt: string;
  meta: any;
  parts: any[];
  reason: string;
  receiver: {
    contacts: Array<{
      annotations: { name: string };
      countryCode: string;
      id: string;
      identifierKey: string;
      identifierValue: string;
      platformAddress: string;
      platformAddressSelector: string;
    }>;
  };
  reference: string;
  sender: {
    connector: {
      id: string;
      identifierValue: string;
    };
  };
  status: string;
  tags: string[];
  template: {
    projectId: string;
    version: string;
    name: string;
    locale: string;
    variables: any;
    parameters: any;
  };
  updatedAt: string;
};

type TGetWhatsAppMessageHistoryParams = {
  limit?: number;
  direction?: "outgoing" | "incoming";
  platform?: "whatsapp" | "sms";
  messageTypes?: TMessageTypes[];
  startAt?: string;
  endAt?: string;
  tags?: string[];
  status?: TStatus[];
  pageToken?: string | null;
};

const MessagesLog = () => {
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterParams, setFilterParams] =
    useState<TGetWhatsAppMessageHistoryParams>({
      limit: 1000,
      direction: "outgoing",
      platform: "whatsapp",
      messageTypes: ["list"],
      startAt: "",
      endAt: "",
      tags: [],
      status: [] as TStatus[],
      pageToken: "",
    });

  const fetchMessages = useCallback(async (filterParams: TGetWhatsAppMessageHistoryParams) => {
    try {
      setLoading(true);
      // filter all null values
      const newFilterParams = Object.keys(filterParams).reduce((acc, key) => {
        if (filterParams[key]) {
          acc[key] = filterParams[key];
        }
        return acc;
      }, {} as TGetWhatsAppMessageHistoryParams);
      const response = await getMarketingMessagesHistoryUrl(newFilterParams);
      const messageHistory = response.data.results;
      if (messageHistory) {
        const { nextPageToken, results, startAt, endAt } = messageHistory;
        if (results.length === 0) {
          setLoading(false);
          return;
        }
        console.log("results", results);
        setFilterParams((prev) => ({ ...prev, startAt, endAt, pageToken: nextPageToken }));
        setMessages((prev) => [...prev, ...results]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchMessages = debounce(fetchMessages, 1000);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "sent":
        return "primary";
      case "delivery failed":
        return "error";
      default:
        return "default";
    }
  };

  const handleNextPage = () => {
    debouncedFetchMessages(filterParams);
  };

  const VirtuosoTableComponents: TableComponents<TMessage, any> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props: any) => (
      <Table
        {...props}
        stickyHeader
        sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
      />
    ),
    TableHead: (props: any) => <TableHead {...props} component="thead" />,
    TableRow: ({ item: _item, ...props }: any) => <TableRow {...props} hover />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableBody {...props} ref={ref} />
    )),
  };

  const handleExportToCSV = () => {
    if (messages.length === 0) {
      alert("No data to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "ID",
      "Direction",
      "Status",
      "From",
      "To",
      "Body",
      "Parameters",
      "Created At",
      "Updated At",
      "Reason",
      "Channel ID",
      "Batch ID",
    ];

    // Convert messages to CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...messages.map(message => {
        const row = [
          `"${message.id}"`,
          `"${message.direction}"`,
          `"${message.status}"`,
          `"${message.sender?.connector?.identifierValue || ""}"`,
          `"${message.receiver?.contacts?.[0]?.platformAddress || ""}"`,
          `"${JSON.stringify(message.body).replace(/"/g, '""')}"`,
          `"${JSON.stringify(message.template?.parameters || "")}"`,
          `"${new Date(message.createdAt).toLocaleString()}"`,
          `"${new Date(message.updatedAt).toLocaleString()}"`,
          `"${message.reason || ""}"`,
          `"${message.channelId}"`,
          `"${message.batchId || ""}"`,
        ];
        return row.join(",");
      })
    ];

    // Create CSV content
    const csvContent = csvRows.join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `messages_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fixedHeaderContent = () => {
    return (
      <TableRow>
        {/* <TableCell width="12%">Direction</TableCell> */}
        <TableCell width="5%">Status</TableCell>
        <TableCell width="5%">Created at</TableCell>
        <TableCell width="8%">To</TableCell>
        <TableCell width="18%">Body</TableCell>
        <TableCell width="18%">Parameters</TableCell>
        <TableCell width="12%">Reason</TableCell>
      </TableRow>
    );
  };

  const rowContent = (_index: number, message: TMessage) => {
    return (
      <>
        {/* <TableCell>{message.direction}</TableCell> */}
        <TableCell>
          <Chip
            label={message.status}
            color={getStatusColor(message.status) as any}
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell sx={{ fontSize: "0.875rem" }}>
          {new Date(message.createdAt).toLocaleString()}
        </TableCell>
        <TableCell>
          {message.receiver?.contacts?.[0]?.platformAddress || "-"}
        </TableCell>
        <TableCell>{JSON.stringify(message.body)}</TableCell>
        <TableCell>{JSON.stringify(message.template?.parameters || "")}</TableCell>
        <TableCell>{message.reason}</TableCell>
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        WhatsApp Messages Log
      </Typography>

      <MessageLogFilters
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        handleNextPage={handleNextPage}
        handleExportToCSV={handleExportToCSV}
      />

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Paper sx={{ width: "100%", height: 600 }}>
          {messages && messages.length > 0 ? (
            <TableVirtuoso
              components={VirtuosoTableComponents}
              data={messages}
              fixedHeaderContent={fixedHeaderContent}
              itemContent={rowContent}
            />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Typography variant="body2" color="text.secondary">
                No messages found
              </Typography>
            </Box>
          )}

          {messages && messages.length > 0 && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Total records: {messages.length}
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default MessagesLog;
