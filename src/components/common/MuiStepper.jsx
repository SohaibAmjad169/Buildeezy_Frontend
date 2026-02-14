import { Stepper, Step, StepLabel } from "@mui/material";
import { styled } from "@mui/material/styles";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import Check from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";

import MuiTypography from "./MuiTypography";

function MuiStepper({ activeStep, steps }) {
  const { t } = useTranslation();

  const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 50,
      left: "calc(-50% + 55px)",
      right: "calc(50% + 65px)",
    },
    // [`&.${stepConnectorClasses.active}`]: {
    //   [`& .${stepConnectorClasses.line}`]: {
    //     borderColor: "#784af4",
    //   },
    // },
    // [`&.${stepConnectorClasses.completed}`]: {
    //   [`& .${stepConnectorClasses.line}`]: {
    //     borderColor: "#784af4",
    //   },
    // },
    // [`& .${stepConnectorClasses.line}`]: {
    //   borderColor:
    //     theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    //   borderTopWidth: 3,
    //   borderRadius: 1,
    // },
  }));

  const QontoStepIconRoot = styled("div")(({ theme, ownerState }) => ({
    color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    // height: 22,
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    opacity: ownerState.active || ownerState.completed ? 1 : 0.5,
    "& .QontoStepIcon-completedIcon": {
      color: theme.palette.common.white,
      zIndex: 1,
      fontSize: 20,
    },
    "& .QontoStepIcon-circle": {
      color: theme.palette.common.white,
    },
  }));

  function QontoStepIcon(props) {
    const { active, completed, className, icon } = props;

    return (
      <QontoStepIconRoot
        ownerState={{ active, completed }}
        className={className}
      >
        {completed ? (
          <Check className="QontoStepIcon-completedIcon" />
        ) : (
          <label className="QontoStepIcon-circle">0{icon}</label>
        )}
      </QontoStepIconRoot>
    );
  }

  return (
    <Stepper
      alternativeLabel
      activeStep={activeStep}
      connector={<QontoConnector />}
      sx={{
        marginLeft: { xs: "-13%", sm: "-15%", md: "-18%" },
      }}
    >
      {steps.map(({ label, description }, index) => {
        const stepProps = {};
        const labelProps = {};
        labelProps.optional = (
          <MuiTypography variant="caption">
            {description ? t(description) : ""}
          </MuiTypography>
        );
        return (
          <Step key={label} {...stepProps}>
            <StepLabel StepIconComponent={QontoStepIcon} {...labelProps}>
              {t(label)}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}

export default MuiStepper;
