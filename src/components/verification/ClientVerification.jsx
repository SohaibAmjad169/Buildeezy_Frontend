import { useEffect, useState } from "react";
import { Box, Divider } from "@mui/material";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";

import useProfileData from "../../hooks/useProfileData";
import AddClient from "../pastClients/AddClient";
import MuiTypography from "../common/MuiTypography";

const CLIENTS = {
  name: "",
  phoneNumber: "",
  email: "",
  document: [],
};
function ClientVerification({ onClientUpdate, error }) {
  const { t } = useTranslation();

  const { profile } = useProfileData();

  const [clients, setClients] = useState();

  useEffect(() => {
    if (!isEmpty(profile)) {
      const pastClients = profile.pastClients || [];

      if (pastClients.length === 0) {
        setClients([CLIENTS, CLIENTS]);
      } else {
        setClients([CLIENTS]);
      }
    }
  }, [profile]);

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

    onClientUpdate(newClients);
  }

  return (
    <Box>
      {clients?.map((client, index) => (
        <Box key={index}>
          <MuiTypography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
            {t("profile.client")} {index + 1}
          </MuiTypography>
          <AddClient
            index={index}
            handleDataChange={onClientValueChange}
            data={client}
          />
          {index < clients.length - 1 && <Divider sx={{ mt: 3 }} />}
        </Box>
      ))}
      {error && (
        <Box sx={{ mt: 2 }}>
          <MuiTypography variant="errorText">{error}</MuiTypography>
        </Box>
      )}
    </Box>
  );
}
export default ClientVerification;
