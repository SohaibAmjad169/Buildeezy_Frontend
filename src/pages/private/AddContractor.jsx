import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Stack, Grid, Breadcrumbs, Divider, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import MuiTypography from "../../components/common/MuiTypography";
import FormFields from "../../components/common/FormFields";
import { FIELD_TYPES } from "../../utils/constants/login";
import { setAlert, setLoading } from "../../redux/configSlice";
import { ALERT_TYPE } from "../../utils/constants/config";
import { createContractorUrl } from "../../apis/apiEndPoints";
import { ROUTES } from "../../utils/constants/route";
import useCountry from "../../hooks/useCountry";
import i18next from "i18next";

const CONTRACTOR_FIELDS = [
  {
    id: "name",
    label: i18next.t("contractor.name"),
    type: FIELD_TYPES.doubleInput,
    placeholder: [
      i18next.t("contractor.first_name"),
      i18next.t("contractor.last_name"),
    ],
    validation: {
      required: true,
      error: "",
      valid: false,
    },
  },
  {
    id: "email",
    label: i18next.t("contractor.email"),
    type: FIELD_TYPES.text,
    placeholder: i18next.t("contractor.email_placeholder"),
    validation: {
      required: true,
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    },
  },
  {
    id: "phone",
    label: i18next.t("contractor.phone"),
    type: FIELD_TYPES.contact,
    placeholder: i18next.t("contractor.phone_placeholder"),
    validation: {
      required: true,
    },
  },
  {
    id: "location",
    label: i18next.t("contractor.located"),
    type: FIELD_TYPES.countryCity,
    placeholder: i18next.t("contractor.select_location"),
    validation: {
      required: true,
      rules: (value) => {
        if (!value?.country?.name || !value?.city?.name) {
          return i18next.t("contractor.error_message");
        }
        return "";
      },
      error: "",
      valid: false,
    },
  },
];

function AddContractor() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getCountries } = useCountry();

  const [fields, setFields] = useState(CONTRACTOR_FIELDS);
  const [values, setValues] = useState({});

  useEffect(() => {
    const fetchCountries = async () => {
      const countries = await getCountries();
      const newFields = [...fields];
      const locationField = newFields.find((field) => field.id === "location");
      if (locationField) {
        locationField.options = countries;
        setFields(newFields);
      }
    };
    fetchCountries();
  }, []);

  const handleFieldChange = (id, value, error) => {
    const newFields = [...fields];
    const fieldIndex = newFields.findIndex((field) => field.id === id);

    if (fieldIndex !== -1) {
      if (id === "name") {
        // Special validation for name field
        const nameError = !value.first
          ? t("errors.first_name_required")
          : !value.second
          ? t("errors.last_name_required")
          : "";
        newFields[fieldIndex].validation.error = nameError;
        newFields[fieldIndex].validation.valid = !nameError;
      } else {
        newFields[fieldIndex].validation.error = error;
        newFields[fieldIndex].validation.valid = !error;
      }
      setFields(newFields);

      setValues((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    // Validate all fields
    const hasErrors = fields.some((field) => !field.validation.valid);
    if (hasErrors) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: t("errors.field_required"),
        })
      );
      return;
    }

    try {
      dispatch(setLoading(true));

      // Call the API to create contractor
      const response = await createContractorUrl({
        data: {
          firstName: values.name.first,
          lastName: values.name.second,
          email: values.email,
          phone: values.phone,
          country: values.location.country.name,
          city: values.location.city.name,
        },
      });

      // Show success message
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.success,
          message: t("contractor.success"),
        })
      );

      // Navigate to review page with contractor data
      navigate(`/${ROUTES.addReview}`, {
        state: {
          contractorId: response.data.data.id,
          contractorName: `${values.name.first} ${values.name.second}`,
          contractorEmail: values.email,
        },
      });
    } catch (error) {
      dispatch(
        setAlert({
          show: true,
          type: ALERT_TYPE.error,
          message: error.message || t("contractor.error"),
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "60%" },
          mb: 4,
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 4 }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/${ROUTES.dashboard}`)}
          >
            <HomeIcon sx={{ fontSize: 20 }} />
            <MuiTypography variant="body2">
              {t("breadcrumbs.dashboard")}
            </MuiTypography>
          </Stack>
          <MuiTypography
            variant="body2"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/${ROUTES.addReview}`)}
          >
            {t("navbar.addReview")}
          </MuiTypography>
          <MuiTypography variant="body2" color="text.primary">
            {t("contractor.add_title")}
          </MuiTypography>
        </Breadcrumbs>

        <Stack direction="row" spacing={2} alignItems="center" mb={4}>
          <MuiTypography variant="h2">
            {t("contractor.add_title")}
          </MuiTypography>
        </Stack>

        <Box
          sx={{
            p: { xs: 2, md: 4 },
            bgcolor: "background.paper",
            borderRadius: "12px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0px 1px 3px rgba(16, 24, 40, 0.1)",
            },
          }}
        >
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {fields.map((field) => (
              <Grid item xs={12} key={field.id}>
                <Stack mb={1.5}>
                  <Stack direction="row" spacing={0.5}>
                    <MuiTypography variant="h6">{field.label}</MuiTypography>
                    {field.validation?.required && (
                      <MuiTypography sx={{ color: "error.main" }}>
                        *
                      </MuiTypography>
                    )}
                  </Stack>
                </Stack>

                <FormFields
                  id={field.id}
                  placeholder={field.placeholder}
                  value={values[field.id]}
                  fieldType={field.type}
                  validation={field.validation}
                  onValueChange={handleFieldChange}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mt: 4, mb: 3 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="flex-end"
          >
            <Button variant="outlined" onClick={handleBack}>
              {t("common.back")}
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {t("contractor.add_title")}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default AddContractor;
