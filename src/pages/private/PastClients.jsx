import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { cloneDeep, isEmpty } from "lodash";

import NoData from "../../components/common/NoData";
import PastClientCard from "../../components/pastClients/PastClientCard";
import MuiActionDialog from "../../components/common/MuiActionDialog";
import useProfileData from "../../hooks/useProfileData";
import AddClient from "../../components/pastClients/AddClient";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import { setProfileData } from "../../redux/profileSlice";
import { useDispatch, useSelector } from "react-redux";
import ActionButton from "../../components/common/ActionButton";

const CLIENTS = {
  name: "",
  phoneNumber: "",
  email: "",
  document: [],
};

function PastClients({ onProfileUpdateComplete }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { profile } = useProfileData();
  const { updateProfile } = useUpdateProfile();
  const { profileData } = useSelector((state) => state.profile);
  const isAdmin = profileData?.userType === "admin";


  console.log(profileData,"profileData")

  const [client, setClient] = useState(CLIENTS);
  const [openAddClient, setOpenAddClient] = useState(false);
  const [pastClientsData, setPastClientsData] = useState([]);
  const [errors, setErrors] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    document: "",
  });

  useEffect(() => {
    if (!isEmpty(profile)) {
      const pastClients = profile.pastClients || [];
      setPastClientsData(pastClients);
    }
  }, [profile]);

  function openAddClientDialog() {
    setOpenAddClient(true);
  }
  function onCloseAddClient() {
    setOpenAddClient(false);
    setClient(CLIENTS);
    setErrors({
      name: "",
      phoneNumber: "",
      email: "",
      document: "",
    });
  }

  const validateClient = () => {
    let tempErrors = { name: "", phoneNumber: "", email: "", document: "" };
    let isValid = true;

    if (!client || !client.name?.trim()) {
      tempErrors.name = "Name is required";
      isValid = false;
    }

    if (!client || !client.phoneNumber?.trim()) {
      tempErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\+?\d{8,}$/.test(client.phoneNumber)) {
      tempErrors.phoneNumber = "Phone number is required";
      isValid = false;
    }

    if (!client || !client.email?.trim()) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(client.email)) {
      tempErrors.email = "Enter a valid email";
      isValid = false;
    }

    // if (
    //   !client ||
    //   !Array.isArray(client.document) ||
    //   client.document.length === 0
    // ) {
    //   tempErrors.document = "At least one document is required";
    //   isValid = false;
    // }

    setErrors(tempErrors);
    return isValid;
  };

  // function onClientValueChange(id, value) {
  //   setClient((prevData) => {
  //     let updatedValue = value;
  //     if (id === "document") {
  //       updatedValue = value(prevData[id]);
  //     }
  //     return { ...prevData, [id]: updatedValue };
  //   });
  // }

  function onClientValueChange(id, value) {
    setClient((prevData) => {
      let updatedValue = value;
      if (id === "document") {
        updatedValue = value(prevData[id]);
      }

      // Remove error for this field if user starts typing
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: "",
      }));

      return { ...prevData, [id]: updatedValue };
    });
  }

  function closeDialog() {
    onCloseAddClient();
    // Trigger profile completion recalculation after adding client
    if (onProfileUpdateComplete) {
      onProfileUpdateComplete();
    }
  }

  // async function onAddClient() {
  //   const clientData = {
  //     pastClients: [{ ...client }],
  //   };

  //   const profilePayload = {
  //     data: {
  //       type: "user_profile",
  //       ...clientData,
  //     },
  //   };
  //   updateProfile(profilePayload, t("profile.client_added"), closeDialog);
  // }

  async function onAddClient() {
    if (!validateClient()) return;

    const clientData = {
      pastClients: [{ ...client }],
    };

    const profilePayload = {
      data: {
        type: !isAdmin ? "user_profile" : "admin_profile",
        ...clientData,
      },
    };

    updateProfile(profilePayload, t("profile.client_added"), closeDialog);
  }

  function onDeleteClient(clientId) {
    const newPastClientData = cloneDeep(pastClientsData);
    const findIndex = newPastClientData.findIndex(
      (client) => client.id === clientId
    );
    newPastClientData.splice(findIndex, 1);

    setPastClientsData(newPastClientData);
    const newProfile = cloneDeep(profile);
    newProfile.pastClients = newPastClientData;

    dispatch(setProfileData(newProfile));
    
    // Trigger profile completion recalculation after deleting client
    if (onProfileUpdateComplete) {
      onProfileUpdateComplete();
    }
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          mt: 2,
        }}
      >
        <ActionButton onClick={openAddClientDialog}>
          {t("profile.add_client")}
        </ActionButton>
      </Box>

      {pastClientsData.length > 0 ? (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 2, sm: 1.5, md: 2.5 },
          }}
        >
          {pastClientsData.map((client) => (
            <PastClientCard
              key={client?.email}
              client={client}
              handleDeleteClient={onDeleteClient}
            />
          ))}
        </Box>
      ) : (
        <NoData />
      )}

      <MuiActionDialog
        width={450}
        open={openAddClient}
        handleClose={onCloseAddClient}
        title={t("profile.add_client")}
        handleSuccess={onAddClient}
        actionTitle={t("submit")}
      >
        <AddClient
          index={0}
          handleDataChange={onClientValueChange}
          data={client}
          errors={errors}
        />
      </MuiActionDialog>
    </>
  );
}

export default PastClients;
