import { useState } from "react";
import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import { cloneDeep } from "lodash";

import MuiTypography from "../common/MuiTypography";
import PastClient from "./PastClient";

const CLIENTS = {
  name: "",
  phoneNumber: "",
  email: "",
  document: [],
};
function PastClientType({ id: questionId, label, onValueChange, value }) {
  const { t } = useTranslation();

  const [clients, setClients] = useState(value || [CLIENTS]);

  function onAddClient() {
    const newClients = [...clients, CLIENTS];
    setClients(newClients);
    onValueChange(questionId, newClients);
  }

  function onDeleteClient(index) {
    const newClients = cloneDeep(clients);
    newClients.splice(index, 1);
    setClients(newClients);
    onValueChange(questionId, newClients);
  }

  function onClientValueChange(id, value, index) {
    let newClients = [...clients];
    setClients((prevData) => {
      newClients = [...prevData];
      let updatedValue = value;
      if (id === "document") {
        updatedValue = value(newClients[index][id]);
      }
      newClients[index] = { ...newClients[index], [id]: updatedValue };
      return newClients;
    });
    onValueChange(questionId, newClients);
  }
  return (
    <>
      <MuiTypography variant="h4" sx={{ fontWeight: 500 }}>
        {label}
      </MuiTypography>

      <Box>
        {clients.map((client, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <PastClient
              index={index}
              handleDataChange={onClientValueChange}
              data={client}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: 2,
              }}
            >
              {clients.length > 1 && (
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ mr: 2 }}
                  onClick={() => onDeleteClient(index)}
                  size="small"
                >
                  {t("onboarding.delete")}
                </Button>
              )}
              {clients.length === index + 1 && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={onAddClient}
                  size="small"
                >
                  {t("onboarding.add_client")}
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
}
export default PastClientType;
