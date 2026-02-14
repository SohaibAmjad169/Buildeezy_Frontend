import React from "react";

import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
} from "@mui/material";
import { Button } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

type TMessageTypes = 'text' | 'html' | 'image' | 'file' | 'gif' | 'location' | 'carousel' | 'list' | 'section' | 'authentication' | 'template' | 'action';
type TStatus = 'accepted' | 'rejected' | 'processing' | 'scheduled' | 'sent' | 'sending_failed' | 'delivered' | 'delivery_failed' | 'deleted' | 'skipped';

type TGetWhatsAppMessageHistoryParams = {
  limit?: number;
  direction?: 'outgoing' | 'incoming';
  platform?: 'whatsapp' | 'sms';
  messageTypes?: TMessageTypes[];
  startAt?: string;
  endAt?: string;
  tags?: string[];
  status?: TStatus[];
  nextPageToken?: string | null;
}
type TMessageLogFiltersProps = {
  filterParams: TGetWhatsAppMessageHistoryParams;
  setFilterParams: (filterParams: TGetWhatsAppMessageHistoryParams) => void;
  handleNextPage: () => void;
  handleExportToCSV: () => void;
}
const MessageLogFilters = ({ filterParams, setFilterParams, handleNextPage, handleExportToCSV }: TMessageLogFiltersProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Direction</InputLabel>
              <Select
                value={filterParams.direction}
                label="Direction"
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    direction: e.target.value as "outgoing" | "incoming",
                  })
                }
              >
                <MenuItem value="outgoing">Outgoing</MenuItem>
                <MenuItem value="incoming">Incoming</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                value={filterParams.platform}
                label="Platform"
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    platform: e.target.value as "whatsapp" | "sms",
                  })
                }
              >
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Limit"
              type="number"
              value={filterParams.limit}
              onChange={(e) =>
                setFilterParams({
                  ...filterParams,
                  limit: parseInt(e.target.value),
                })
              }
              inputProps={{ min: 1, max: 100 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <DateTimePicker
              label="Start Date"
              value={filterParams.startAt ? dayjs(filterParams.startAt) : null}
              onChange={(newValue) =>
                setFilterParams({
                  ...filterParams,
                  startAt: newValue ? newValue.toISOString() : "",
                })
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <DateTimePicker
              label="End Date"
              value={filterParams.endAt ? dayjs(filterParams.endAt) : null}
              onChange={(newValue) =>
                setFilterParams({
                  ...filterParams,
                  endAt: newValue ? newValue.toISOString() : "",
                })
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Message Types</InputLabel>
              <Select
                multiple
                value={filterParams.messageTypes ?? []}
                label="Message Types"
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    messageTypes:
                      typeof e.target.value === "string"
                        ? (e.target.value.split(",") as TMessageTypes[])
                        : e.target.value,
                  })
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="file">File</MenuItem>
                <MenuItem value="gif">GIF</MenuItem>
                <MenuItem value="location">Location</MenuItem>
                <MenuItem value="carousel">Carousel</MenuItem>
                <MenuItem value="list">List</MenuItem>
                <MenuItem value="section">Section</MenuItem>
                <MenuItem value="authentication">Authentication</MenuItem>
                <MenuItem value="template">Template</MenuItem>
                <MenuItem value="action">Action</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button variant="contained" disabled={filterParams.nextPageToken === null} onClick={handleNextPage}>Load More</Button> 
            <Button variant="outlined" sx={{ ml: 2 }} onClick={handleExportToCSV}>Export to CSV</Button>
          </Grid>

          {/* <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={filterParams.status ?? []}
                label="Status"
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    status:
                      typeof e.target.value === "string"
                        ? (e.target.value.split(",") as TStatus[])
                        : e.target.value,
                  })
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="sending_failed">Sending Failed</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="delivery_failed">Delivery Failed</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
                <MenuItem value="skipped">Skipped</MenuItem>
              </Select>
            </FormControl>
          </Grid> */}

          {/* <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={filterParams.tags ?? []}
                label="Tags"
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    tags:
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value,
                  })
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
              </Select>
            </FormControl>
          </Grid> */}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default MessageLogFilters;